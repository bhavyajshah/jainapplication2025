import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Student } from '../../src/types';

export default function AdminDashboardScreen() {
    const [students, setStudents] = useState<Student[]>([]);
    const [todayAttendance, setTodayAttendance] = useState<{
        present: number;
        absent: number;
        total: number;
    }>({ present: 0, absent: 0, total: 0 });
    const [refreshing, setRefreshing] = useState(false);

    const fetchStudentsAndAttendance = async () => {
        try {
            // Fetch all students
            const studentsRef = collection(db, 'users');
            const studentsQuery = query(studentsRef, where('role', '==', 'student'));
            const studentsSnapshot = await getDocs(studentsQuery);
            const studentsList: Student[] = [];
            studentsSnapshot.forEach((doc) => {
                studentsList.push({ id: doc.id, ...doc.data() } as Student);
            });
            setStudents(studentsList);

            // Get today's attendance
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const attendanceRef = collection(db, 'attendance');
            const attendanceQuery = query(
                attendanceRef,
                where('date', '>=', Timestamp.fromDate(today)),
                where('date', '<', Timestamp.fromDate(tomorrow))
            );
            const attendanceSnapshot = await getDocs(attendanceQuery);

            let presentCount = 0;
            attendanceSnapshot.forEach((doc) => {
                if (doc.data().status === 'present') {
                    presentCount++;
                }
            });

            setTodayAttendance({
                present: presentCount,
                absent: studentsList.length - presentCount,
                total: studentsList.length
            });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchStudentsAndAttendance();
        setRefreshing(false);
    };

    useEffect(() => {
        fetchStudentsAndAttendance();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Admin Dashboard</Text>
                        <Text style={styles.headerSubtitle}>Welcome back, Admin</Text>
                    </View>
                </View>

                {/* Quick Stats Cards */}
                <View style={styles.statsContainer}>
                    <View style={[styles.statCard, { backgroundColor: '#4CAF50' }]}>
                        <Text style={styles.statNumber}>{todayAttendance.present}</Text>
                        <Text style={styles.statLabel}>Present Today</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: '#F44336' }]}>
                        <Text style={styles.statNumber}>{todayAttendance.absent}</Text>
                        <Text style={styles.statLabel}>Absent Today</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: '#2196F3' }]}>
                        <Text style={styles.statNumber}>{todayAttendance.total}</Text>
                        <Text style={styles.statLabel}>Total Students</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.actionsContainer}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.actionGrid}>
                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => router.push('/admin/attendance-management')}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
                                <Ionicons name="calendar" size={24} color="#1976D2" />
                            </View>
                            <Text style={styles.actionTitle}>Manage Attendance</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => router.push('/admin/student-management')}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
                                <Ionicons name="people" size={24} color="#2E7D32" />
                            </View>
                            <Text style={styles.actionTitle}>Student Management</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => router.push('/(admin)/announcements')}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
                                <Ionicons name="megaphone" size={24} color="#E65100" />
                            </View>
                            <Text style={styles.actionTitle}>Announcements</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => router.push('/(admin)/reports')}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#F3E5F5' }]}>
                                <Ionicons name="bar-chart" size={24} color="#7B1FA2" />
                            </View>
                            <Text style={styles.actionTitle}>Reports</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Recent Students */}
                <View style={styles.studentsContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Students</Text>
                        <TouchableOpacity onPress={() => router.push('/(admin)/student-management')}>
                            <Text style={styles.seeAllButton}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {students.slice(0, 5).map((student) => (
                        <TouchableOpacity
                            key={student.id}
                            style={styles.studentCard}
                            onPress={() => router.push(`/(admin)/student/${student.id}`)}
                        >
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop' }}
                                style={styles.studentAvatar}
                            />
                            <View style={styles.studentInfo}>
                                <Text style={styles.studentName}>{student.name}</Text>
                                <Text style={styles.studentClass}>Class: {student.class}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="#666" />
                        </TouchableOpacity>
                    ))}
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
        backgroundColor: '#1976D2',
        padding: 20,
        paddingTop: 40,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerContent: {
        marginTop: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 4,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        marginTop: -30,
    },
    statCard: {
        flex: 1,
        margin: 4,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    statLabel: {
        fontSize: 12,
        color: 'white',
        marginTop: 4,
    },
    actionsContainer: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    actionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    actionCard: {
        width: '48%',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    actionTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    studentsContainer: {
        padding: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    seeAllButton: {
        color: '#1976D2',
        fontSize: 14,
        fontWeight: '500',
    },
    studentCard: {
        flexDirection: 'row',
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
    studentAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    studentInfo: {
        flex: 1,
        marginLeft: 12,
    },
    studentName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    studentClass: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
});