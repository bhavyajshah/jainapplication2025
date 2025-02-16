import { Stack } from 'expo-router';

export default function AdminLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="students"
                options={{
                    title: 'Manage Students',
                    headerShown: true
                }}
            />
            <Stack.Screen
                name="classes"
                options={{
                    title: 'Manage Classes',
                    headerShown: true
                }}
            />
            <Stack.Screen
                name="create-announcement"
                options={{
                    title: 'Create Announcement',
                    headerShown: true
                }}
            />
            <Stack.Screen
                name="attendance-reports"
                options={{
                    title: 'Attendance Reports',
                    headerShown: true
                }}
            />
            <Stack.Screen
                name="add-gatha"
                options={{
                    title: 'Add Gatha',
                    headerShown: true
                }}
            />
        </Stack>
    );
}