import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../../src/store/authStore';
import { Ionicons } from '@expo/vector-icons';

export default function AdminDashboardScreen() {
  const { user } = useAuthStore();
  const [pendingRequests, setPendingRequests] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    if (!user || user.role !== 'admin') return;

    try {
      // Fetch pending attendance requests
      const requestsRef = collection(db, 'attendance');
      const requestsQuery = query(
        requestsRef,
        where('status', '==', 'under_review'),
        where('reviewRequest.status', '==', 'pending')
      );
      const requestsSnapshot = await getDocs(requestsQuery);
      setPendingRequests(requestsSnapshot.size);

      // Fetch total students
      const studentsRef = collection(db, 'users');
      const studentsQuery = query(studentsRef, where('role', '==', 'student'));
      const studentsSnapshot = await getDocs(studentsQuery);
      setTotalStudents(studentsSnapshot.size);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  if (!user || user.role !== 'admin') {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Access Denied</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome, Admin!</Text>
        </View>

        <View style={styles.statsGrid}>
          <Link href="/manage/attendance-requests" asChild>
            <TouchableOpacity style={styles.statCard}>
              <Ionicons name="time" size={32} color="#FF9800" />
              <Text style={styles.statValue}>{pendingRequests}</Text>
              <Text style={styles.statLabel}>Pending Requests</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/manage/students" asChild>
            <TouchableOpacity style={styles.statCard}>
              <Ionicons name="people" size={32} color="#4CAF50" />
              <Text style={styles.statValue}>{totalStudents}</Text>
              <Text style={styles.statLabel}>Total Students</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <Link href="/manage/announcements" asChild>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="megaphone" size={24} color="#1976D2" />
              <Text style={styles.actionText}>Create Announcement</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/manage/attendance-requests" asChild>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="checkmark-circle" size={24} color="#1976D2" />
              <Text style={styles.actionText}>Review Attendance</Text>
            </TouchableOpacity>
          </Link>
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
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: '45%',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  quickActions: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 20,
  },
});