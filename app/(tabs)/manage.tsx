import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

export default function ManageScreen() {
  const { user } = useAuthStore();
  const [pendingReviews, setPendingReviews] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    if (!user || user.role !== 'admin') return;

    try {
      // Fetch pending reviews count
      const reviewsQuery = query(
        collection(db, 'attendance'),
        where('reviewRequest.status', '==', 'pending')
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      setPendingReviews(reviewsSnapshot.size);

      // Fetch total students count
      const studentsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'student')
      );
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
      <View style={styles.container}>
        <Text style={styles.errorText}>Access Denied</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
      </View>

      <View style={styles.statsGrid}>
        <Link href="/manage/reviews" asChild>
          <TouchableOpacity style={styles.statCard}>
            <Ionicons name="flag" size={32} color="#FF9800" />
            <Text style={styles.statValue}>{pendingReviews}</Text>
            <Text style={styles.statLabel}>Pending Reviews</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/manage/students" asChild>
          <TouchableOpacity style={styles.statCard}>
            <Ionicons name="people" size={32} color="#4CAF50" />
            <Text style={styles.statValue}>{totalStudents}</Text>
            <Text style={styles.statLabel}>Total Students</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/manage/gathas" asChild>
          <TouchableOpacity style={styles.statCard}>
            <Ionicons name="book" size={32} color="#2196F3" />
            <Text style={styles.statLabel}>Manage Gathas</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/manage/announcements" asChild>
          <TouchableOpacity style={styles.statCard}>
            <Ionicons name="megaphone" size={32} color="#9C27B0" />
            <Text style={styles.statLabel}>Announcements</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <Link href="/manage/attendance" asChild>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="calendar" size={24} color="#1976D2" />
            <Text style={styles.actionText}>Mark Attendance</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/manage/new-announcement" asChild>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="create" size={24} color="#1976D2" />
            <Text style={styles.actionText}>Create Announcement</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    margin: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  quickActions: {
    padding: 20,
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