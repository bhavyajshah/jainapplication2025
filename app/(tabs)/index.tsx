import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Text, DrawerLayoutAndroid, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { useAuthStore } from '../../src/store/authStore';
import { AttendanceRecord } from '../../src/types';
import AttendanceCard from '../components/AttendanceCard';
import StreakCounter from '../components/StreakCounter';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [drawerRef, setDrawerRef] = useState<DrawerLayoutAndroid | null>(null);

  const fetchAttendance = async () => {
    if (!user) return;

    try {
      setDataLoading(true);
      const attendanceRef = collection(db, 'attendance');
      const q = query(
        attendanceRef,
        where('studentId', '==', user.id)
      );

      const querySnapshot = await getDocs(q);
      const records: AttendanceRecord[] = [];
      querySnapshot.forEach((doc) => {
        records.push({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate()
        } as AttendanceRecord);
      });

      // Sort records by date after fetching
      records.sort((a, b) => b.date.getTime() - a.date.getTime());

      setAttendance(records);
      calculateStreaks(records);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const calculateStreaks = (records: AttendanceRecord[]) => {
    let current = 0;
    let longest = 0;
    let currentCount = 0;

    records.forEach((record) => {
      if (record.status === 'present') {
        currentCount++;
        longest = Math.max(longest, currentCount);
      } else {
        currentCount = 0;
      }
    });

    current = currentCount;
    setCurrentStreak(current);
    setLongestStreak(longest);
  };

  const markAttendance = async () => {
    if (!user || loading) return;

    try {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if attendance already marked for today
      const existingAttendance = attendance.find(
        (record) => new Date(record.date).setHours(0, 0, 0, 0) === today.getTime()
      );

      if (existingAttendance) {
        alert('Attendance already marked for today');
        return;
      }

      // Create attendance request
      const attendanceData = {
        studentId: user.id,
        date: serverTimestamp(),
        status: 'under_review',
        reviewRequest: {
          reason: 'Student marked attendance',
          timestamp: serverTimestamp(),
          status: 'pending'
        }
      };

      await addDoc(collection(db, 'attendance'), attendanceData);
      await fetchAttendance();
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAttendance();
    setRefreshing(false);
  };

  useEffect(() => {
    if (user) {
      fetchAttendance();
    }
  }, [user]);

  const navigationView = (
    <View style={styles.drawer}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>Menu</Text>
      </View>
      <TouchableOpacity style={styles.drawerItem} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
        <Text style={styles.drawerItemText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );

  if (!user) return null;

  const MainContent = () => (
    <ScrollView
      style={styles.scrollView}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {user.name}!</Text>
        <TouchableOpacity
          style={[styles.markAttendanceButton, loading && styles.buttonDisabled]}
          onPress={markAttendance}
          disabled={loading}
        >
          <Ionicons name="checkmark-circle" size={24} color="white" />
          <Text style={styles.markAttendanceText}>
            {loading ? 'Marking...' : 'Mark Attendance'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <StreakCounter
        currentStreak={currentStreak}
        longestStreak={longestStreak}
      />

      <View style={styles.attendanceList}>
        <Text style={styles.sectionTitle}>Recent Attendance</Text>
        {dataLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Loading attendance...</Text>
          </View>
        ) : attendance.length > 0 ? (
          attendance.map((record) => (
            <AttendanceCard
              key={record.id}
              record={record}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#666" />
            <Text style={styles.emptyStateText}>No attendance records yet</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  if (Platform.OS === 'android') {
    return (
      <SafeAreaView style={styles.container}>
        <DrawerLayoutAndroid
          ref={(ref) => setDrawerRef(ref)}
          drawerWidth={300}
          drawerPosition="left"
          renderNavigationView={() => navigationView}
        >
          <MainContent />
        </DrawerLayoutAndroid>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MainContent />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  markAttendanceButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  markAttendanceText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  attendanceList: {
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    margin: 16,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#FEE2E2',
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  drawer: {
    flex: 1,
    backgroundColor: 'white',
  },
  drawerHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  drawerItemText: {
    marginLeft: 16,
    fontSize: 16,
    color: '#333',
  },
});