import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Student, AttendanceRecord } from '../../../src/types';
import { Ionicons } from '@expo/vector-icons';

export default function StudentProfileScreen() {
  const { id } = useLocalSearchParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        // Fetch student details
        const studentDoc = await getDoc(doc(db, 'users', id as string));
        if (studentDoc.exists()) {
          setStudent({ id: studentDoc.id, ...studentDoc.data() } as Student);
        }

        // Fetch recent attendance
        const attendanceRef = collection(db, 'attendance');
        const q = query(
          attendanceRef,
          where('studentId', '==', id)
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

        records.sort((a, b) => b.date.getTime() - a.date.getTime());
        setAttendance(records);
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  if (!student) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Student not found</Text>
      </View>
    );
  }

  const attendanceStats = {
    total: attendance.length,
    present: attendance.filter(record => record.status === 'present').length,
    absent: attendance.filter(record => record.status === 'absent').length,
  };

  const attendancePercentage = attendanceStats.total > 0
    ? Math.round((attendanceStats.present / attendanceStats.total) * 100)
    : 0;

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{student.name}</Text>
        <Text style={styles.email}>{student.email}</Text>
        <View style={styles.classContainer}>
          <Ionicons name="school" size={16} color="#666" />
          <Text style={styles.className}>Class: {student.class}</Text>
        </View>
      </View>

      {/* Attendance Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{attendancePercentage}%</Text>
          <Text style={styles.statLabel}>Attendance Rate</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{attendanceStats.present}</Text>
          <Text style={styles.statLabel}>Days Present</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{attendanceStats.absent}</Text>
          <Text style={styles.statLabel}>Days Absent</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="mail" size={20} color="#1976D2" />
          <Text style={styles.actionText}>Send Message</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="create" size={20} color="#1976D2" />
          <Text style={styles.actionText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Attendance */}
      <View style={styles.attendanceContainer}>
        <Text style={styles.sectionTitle}>Recent Attendance</Text>
        {attendance.slice(0, 5).map((record) => (
          <View key={record.id} style={styles.attendanceRecord}>
            <View style={styles.dateContainer}>
              <Text style={styles.date}>
                {record.date.toLocaleDateString()}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    record.status === 'present'
                      ? '#4CAF50'
                      : record.status === 'absent'
                      ? '#F44336'
                      : '#FFC107',
                },
              ]}
            >
              <Text style={styles.statusText}>
                {record.status.toUpperCase()}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#F44336',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  classContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  className: {
    marginLeft: 8,
    color: '#1976D2',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    margin: 4,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    margin: 4,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    marginLeft: 8,
    color: '#1976D2',
    fontWeight: '500',
  },
  attendanceContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  attendanceRecord: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateContainer: {
    flex: 1,
  },
  date: {
    fontSize: 16,
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});