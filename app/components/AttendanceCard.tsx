import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AttendanceRecord } from '../types/attendance';

interface Props {
  record: AttendanceRecord;
  onRequestReview?: () => void;
}

export default function AttendanceCard({ record, onRequestReview }: Props) {
  const getStatusColor = () => {
    switch (record.status) {
      case 'present':
        return '#4CAF50';
      case 'absent':
        return '#F44336';
      case 'under_review':
        return '#FFC107';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <View style={[styles.card, { borderLeftColor: getStatusColor() }]}>
      <View style={styles.header}>
        <Text style={styles.date}>
          {new Date(record.date).toLocaleDateString()}
        </Text>
        <View style={[styles.badge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.badgeText}>
            {record.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>
      
      {record.status === 'absent' && !record.reviewRequest && onRequestReview && (
        <TouchableOpacity
          style={styles.reviewButton}
          onPress={onRequestReview}
        >
          <Ionicons name="flag-outline" size={20} color="#F44336" />
          <Text style={styles.reviewButtonText}>Request Review</Text>
        </TouchableOpacity>
      )}

      {record.reviewRequest && (
        <View style={styles.reviewInfo}>
          <Text style={styles.reviewStatus}>
            Review Status: {record.reviewRequest.status.toUpperCase()}
          </Text>
          <Text style={styles.reviewReason}>
            Reason: {record.reviewRequest.reason}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  reviewButtonText: {
    marginLeft: 8,
    color: '#F44336',
    fontWeight: '600',
  },
  reviewInfo: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  reviewStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  reviewReason: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});