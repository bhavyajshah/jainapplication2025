import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../../src/store/authStore';
import { AttendanceRecord } from '../../../src/types/attendance';
import { Ionicons } from '@expo/vector-icons';

export default function AttendanceRequestsScreen() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<AttendanceRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    if (!user || user.role !== 'admin') return;

    const requestsRef = collection(db, 'attendance');
    const q = query(
      requestsRef,
      where('status', '==', 'under_review'),
      where('reviewRequest.status', '==', 'pending')
    );

    const querySnapshot = await getDocs(q);
    const requestsList: AttendanceRecord[] = [];
    querySnapshot.forEach((doc) => {
      requestsList.push({ id: doc.id, ...doc.data() } as AttendanceRecord);
    });

    setRequests(requestsList);
  };

  const handleRequest = async (requestId: string, approved: boolean) => {
    if (loading) return;

    try {
      setLoading(true);
      const attendanceRef = doc(db, 'attendance', requestId);
      await updateDoc(attendanceRef, {
        status: approved ? 'present' : 'absent',
        'reviewRequest.status': approved ? 'approved' : 'rejected'
      });

      await fetchRequests();
    } catch (error) {
      console.error('Error handling request:', error);
      alert('Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchRequests();
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
          <Text style={styles.title}>Attendance Requests</Text>
        </View>

        {requests.map((request) => (
          <View key={request.id} style={styles.requestCard}>
            <View style={styles.requestInfo}>
              <Text style={styles.studentName}>Student ID: {request.studentId}</Text>
              <Text style={styles.date}>
                Date: {new Date(request.date).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => handleRequest(request.id, true)}
                disabled={loading}
              >
                <Ionicons name="checkmark-circle" size={24} color="white" />
                <Text style={styles.actionText}>Approve</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleRequest(request.id, false)}
                disabled={loading}
              >
                <Ionicons name="close-circle" size={24} color="white" />
                <Text style={styles.actionText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {requests.length === 0 && (
          <Text style={styles.emptyText}>No pending requests</Text>
        )}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  requestCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestInfo: {
    marginBottom: 16,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 32,
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 20,
  },
});