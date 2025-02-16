import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

type IconName = 'people' | 'school' | 'megaphone' | 'calendar' | 'book';

interface ManagementOption {
    title: string;
    icon: IconName;
    onPress: () => void;
}

export default function AdminScreen() {
    const managementOptions: ManagementOption[] = [
        {
            title: 'Manage Students',
            icon: 'people',
            onPress: () => router.push('/admin/students' as any),
        },
        {
            title: 'Manage Classes',
            icon: 'school',
            onPress: () => router.push('/admin/classes' as any),
        },
        {
            title: 'Create Announcement',
            icon: 'megaphone',
            onPress: () => router.push('/admin/create-announcement' as any),
        },
        {
            title: 'Attendance Reports',
            icon: 'calendar',
            onPress: () => router.push('/admin/attendance-reports' as any),
        },
        {
            title: 'Add Gatha',
            icon: 'book',
            onPress: () => router.push('/admin/add-gatha' as any),
        }
    ];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Admin Dashboard</Text>
            </View>

            <View style={styles.grid}>
                {managementOptions.map((option, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.card}
                        onPress={option.onPress}
                    >
                        <Ionicons name={option.icon} size={32} color="#4A90E2" />
                        <Text style={styles.cardTitle}>{option.title}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    grid: {
        padding: 15,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        width: '48%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        marginTop: 10,
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        textAlign: 'center',
    },
});