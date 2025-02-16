import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, orderBy, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../../src/store/authStore';
import { AttendanceRecord } from '../../src/types/attendance';
import AttendanceCard from '../components/AttendanceCard';
import StreakCounter from '../components/StreakCounter';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchAttendance = async () => {
    if (!user) return;

    const attendanceRef = collection(db, 'attendance');
    const q = query(
      attendanceRef,
      where('studentId', '==', user.id),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const records: AttendanceRecord[] = [];
    querySnapshot.forEach((doc) => {
      records.push({ id: doc.id, ...doc.data() } as AttendanceRecord);
    });

    setAttendance(records);
    calculateStreaks(records);
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
      await addDoc(collection(db, 'attendance'), {
        studentId: user.id,
        date: Timestamp.fromDate(new Date()),
        status: 'under_review',
        reviewRequest: {
          reason: 'Student marked attendance',
          timestamp: Timestamp.fromDate(new Date()),
          status: 'pending'
        }
      });

      await fetchAttendance();
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAttendance();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAttendance();
  }, [user]);

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container}>
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
        </View>

        <StreakCounter
          currentStreak={currentStreak}
          longestStreak={longestStreak}
        />

        <View style={styles.attendanceList}>
          <Text style={styles.sectionTitle}>Recent Attendance</Text>
          {attendance.map((record) => (
            <AttendanceCard
              key={record.id}
              record={record}
            />
          ))}
        </View>
      </ScrollView>
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
});