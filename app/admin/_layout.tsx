import { Stack, useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';

export default function AdminLayout() {
    const { user } = useAuthStore();
    const rootNavigationState = useRootNavigationState();

    useEffect(() => {
        if (!rootNavigationState?.key) return;

        if (user?.role !== 'admin') {
            router.replace('/(tabs)');
        }
    }, [user, rootNavigationState?.key]);

    if (user?.role !== 'admin') return null;

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="dashboard"
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