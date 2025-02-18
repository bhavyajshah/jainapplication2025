import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../../src/store/authStore';
import { GathaRecord } from '../../src/types/attendance';
import { Ionicons } from '@expo/vector-icons';

export default function GathasScreen() {
  const { user } = useAuthStore();
  const [gathas, setGathas] = useState<GathaRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGathas = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const gathasRef = collection(db, 'gathas');
      const q = query(
        gathasRef,
        where('studentId', '==', user.id),
        orderBy('completedDate', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const gathaRecords: GathaRecord[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        gathaRecords.push({
          id: doc.id,
          ...data,
          completedDate: data.completedDate.toDate(),
        } as GathaRecord);
      });

      setGathas(gathaRecords);
    } catch (error) {
      console.error('Error fetching gathas:', error);
      setError('Failed to load gathas. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGathas();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchGathas();
  }, [user]);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'excellent':
        return '#4CAF50';
      case 'good':
        return '#2196F3';
      case 'needs_improvement':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading gathas...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
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
        <Text style={styles.title}>My Gathas</Text>
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{gathas.length}</Text>
            <Text style={styles.statLabel}>Total Gathas</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {gathas.filter((g) => g.grade === 'excellent').length}
            </Text>
            <Text style={styles.statLabel}>Excellent</Text>
          </View>
        </View>
      </View>

      <View style={styles.gathaList}>
        {gathas.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={48} color="#666" />
            <Text style={styles.emptyStateText}>No gathas completed yet</Text>
          </View>
        ) : (
          gathas.map((gatha) => (
            <View key={gatha.id} style={styles.gathaCard}>
              <View style={styles.gathaHeader}>
                <Text style={styles.gathaName}>{gatha.gathaName}</Text>
                <View
                  style={[
                    styles.gradeBadge,
                    { backgroundColor: getGradeColor(gatha.grade) },
                  ]}
                >
                  <Text style={styles.gradeText}>
                    {gatha.grade.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.date}>
                {new Date(gatha.completedDate).toLocaleDateString()}
              </Text>
              {gatha.notes && <Text style={styles.notes}>{gatha.notes}</Text>}

              <TouchableOpacity style={styles.practiceButton}>
                <Ionicons name="play-circle" size={20} color="#4CAF50" />
                <Text style={styles.practiceButtonText}>Practice Now</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  errorText: {
    color: '#FF5252',
    textAlign: 'center',
    fontSize: 16,
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  gathaList: {
    padding: 16,
  },
  gathaCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gathaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gathaName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  gradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gradeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  notes: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  practiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 8,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  practiceButtonText: {
    marginLeft: 8,
    color: '#4CAF50',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});