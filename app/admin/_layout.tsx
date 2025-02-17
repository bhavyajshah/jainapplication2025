import { Stack } from 'expo-router';

export default function AdminLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: 'Admin Dashboard',
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="student-management"
                options={{
                    title: 'Student Management',
                    headerShown: true
                }}
            />
            <Stack.Screen
                name="attendance-management"
                options={{
                    title: 'Attendance Management',
                    headerShown: true
                }}
            />
            <Stack.Screen
                name="announcements"
                options={{
                    title: 'Announcements',
                    headerShown: true
                }}
            />
            <Stack.Screen
                name="reports"
                options={{
                    title: 'Reports',
                    headerShown: true
                }}
            />
            <Stack.Screen
                name="student/[id]"
                options={{
                    title: 'Student Profile',
                    headerShown: true
                }}
            />
        </Stack>
    );
}