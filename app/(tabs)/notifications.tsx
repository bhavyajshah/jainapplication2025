import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { collection, query, where, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../../src/store/authStore';
import { Ionicons } from '@expo/vector-icons';

interface Notification {
    id: string;
    title: string;
    message: string;
    createdAt: Date;
    type: 'announcement' | 'attendance' | 'gatha';
    read: boolean;
    studentId?: string;
}

export default function NotificationsScreen() {
    const { user } = useAuthStore();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        if (!user) return;

        try {
            const notificationsRef = collection(db, 'notifications');
            const q = query(
                notificationsRef,
                where('studentId', 'in', [user.id, 'all']),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const notificationsList: Notification[] = [];
            querySnapshot.forEach((doc) => {
                notificationsList.push({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt.toDate(),
                } as Notification);
            });

            setNotifications(notificationsList);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            const notificationRef = doc(db, 'notifications', notificationId);
            await updateDoc(notificationRef, {
                read: true
            });

            // Update local state
            setNotifications(prev =>
                prev.map(notification =>
                    notification.id === notificationId
                        ? { ...notification, read: true }
                        : notification
                )
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchNotifications();
        setRefreshing(false);
    };

    useEffect(() => {
        fetchNotifications();
    }, [user]);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'announcement':
                return 'megaphone';
            case 'attendance':
                return 'calendar';
            case 'gatha':
                return 'book';
            default:
                return 'notifications';
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'announcement':
                return '#FF9800';
            case 'attendance':
                return '#4CAF50';
            case 'gatha':
                return '#2196F3';
            default:
                return '#9E9E9E';
        }
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View style={styles.header}>
                <Text style={styles.title}>Notifications</Text>
            </View>

            {notifications.map((notification) => (
                <TouchableOpacity
                    key={notification.id}
                    style={[
                        styles.notificationCard,
                        !notification.read && styles.unreadCard,
                    ]}
                    onPress={() => markAsRead(notification.id)}
                >
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name={getNotificationIcon(notification.type)}
                            size={24}
                            color={getNotificationColor(notification.type)}
                        />
                    </View>
                    <View style={styles.content}>
                        <Text style={styles.notificationTitle}>{notification.title}</Text>
                        <Text style={styles.message}>{notification.message}</Text>
                        <Text style={styles.timestamp}>
                            {new Date(notification.createdAt).toLocaleDateString()}
                        </Text>
                    </View>
                    {!notification.read && (
                        <View style={styles.unreadDot} />
                    )}
                </TouchableOpacity>
            ))}

            {notifications.length === 0 && (
                <View style={styles.emptyState}>
                    <Ionicons name="notifications-off" size={48} color="#666" />
                    <Text style={styles.emptyStateText}>No notifications yet</Text>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
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
    notificationCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 16,
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    unreadCard: {
        backgroundColor: '#E3F2FD',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    message: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    timestamp: {
        fontSize: 12,
        color: '#999',
    },
    unreadDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#1976D2',
        marginLeft: 8,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        marginTop: 32,
    },
    emptyStateText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});