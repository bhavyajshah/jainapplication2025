import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  currentStreak: number;
  longestStreak: number;
}

export default function StreakCounter({ currentStreak, longestStreak }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.streakCard}>
        <Ionicons name="flame" size={32} color="#FF9800" />
        <Text style={styles.streakCount}>{currentStreak}</Text>
        <Text style={styles.streakLabel}>Current Streak</Text>
      </View>
      
      <View style={styles.streakCard}>
        <Ionicons name="trophy" size={32} color="#FFC107" />
        <Text style={styles.streakCount}>{longestStreak}</Text>
        <Text style={styles.streakLabel}>Longest Streak</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  streakCard: {
    alignItems: 'center',
    padding: 16,
  },
  streakCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 8,
  },
  streakLabel: {
    fontSize: 14,
    color: '#666',
  },
});