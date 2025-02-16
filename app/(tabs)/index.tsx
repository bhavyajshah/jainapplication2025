import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';
import { AttendanceRecord } from '../types/attendance';
import AttendanceCard from '../components/AttendanceCard';
import StreakCounter from '../components/StreakCounter';

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAttendance();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAttendance();
  }, [user]);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <StreakCounter
        currentStreak={currentStreak}
        longestStreak={longestStreak}
      />
      <View style={styles.attendanceList}>
        {attendance.map((record) => (
          <AttendanceCard
            key={record.id}
            record={record}
            onRequestReview={() => {
              // Implement review request logic
            }}
          />
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
  attendanceList: {
    paddingBottom: 16,
  },
});