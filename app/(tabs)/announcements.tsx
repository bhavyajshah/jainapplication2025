import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  priority: 'high' | 'medium' | 'low';
}

export default function AnnouncementsScreen() {
  const { user } = useAuthStore();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const announcementsRef = collection(db, 'announcements');
      const q = query(announcementsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const announcementList: Announcement[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        announcementList.push({
          id: doc.id,
          title: data.title,
          content: data.content,
          createdAt: data.createdAt.toDate(),
          priority: data.priority,
        });
      });

      setAnnouncements(announcementList);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setError('Failed to load announcements. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAnnouncements();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [user]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#FF5252';
      case 'medium':
        return '#FFC107';
      case 'low':
        return '#4CAF50';
      default:
        return '#9E9E9E';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'alert-circle';
      case 'medium':
        return 'information-circle';
      case 'low':
        return 'checkmark-circle';
      default:
        return 'help-circle';
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading announcements...</Text>
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
        <Text style={styles.title}>Announcements</Text>
      </View>

      <View style={styles.announcementList}>
        {announcements.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off" size={48} color="#666" />
            <Text style={styles.emptyStateText}>No announcements yet</Text>
          </View>
        ) : (
          announcements.map((announcement) => (
            <View
              key={announcement.id}
              style={[
                styles.announcementCard,
                {
                  borderLeftColor: getPriorityColor(announcement.priority),
                },
              ]}
            >
              <View style={styles.announcementHeader}>
                <View style={styles.titleContainer}>
                  <Ionicons
                    name={getPriorityIcon(announcement.priority)}
                    size={24}
                    color={getPriorityColor(announcement.priority)}
                  />
                  <Text style={styles.announcementTitle}>
                    {announcement.title}
                  </Text>
                </View>
                <Text style={styles.date}>
                  {new Date(announcement.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.content}>{announcement.content}</Text>
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
  errorText: {
    color: '#FF5252',
    textAlign: 'center',
    fontSize: 16,
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  announcementList: {
    padding: 16,
  },
  announcementCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  announcementHeader: {
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
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