import { Stack } from 'expo-router';

export default function ManageLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Admin Dashboard',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="attendance-requests" 
        options={{ 
          title: 'Attendance Requests',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="students" 
        options={{ 
          title: 'Manage Students',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="announcements" 
        options={{ 
          title: 'Manage Announcements',
          headerShown: true 
        }} 
      />
    </Stack>
  );
}