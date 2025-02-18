import { Stack, useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function AdminLayout() {
    const { user, isLoading } = useAuthStore();
    const rootNavigationState = useRootNavigationState();

    useEffect(() => {
        if (!rootNavigationState?.key) return;

        if (user?.role !== 'admin') {
            router.replace('/(tabs)');
        }
    }, [user, rootNavigationState?.key]);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4A90E2" />
            </View>
        );
    }

    if (user?.role !== 'admin') return null;

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="index"
                options={{
                    title: 'Admin Dashboard'
                }}
            />
            <Stack.Screen
                name="notifications"
                options={{
                    headerShown: true,
                    title: 'Send Notifications'
                }}
            />
            <Stack.Screen
                name="students"
                options={{
                    headerShown: true,
                    title: 'Manage Students'
                }}
            />
            <Stack.Screen
                name="student/[id]"
                options={{
                    headerShown: true,
                    title: 'Student Profile'
                }}
            />
        </Stack>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});