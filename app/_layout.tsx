import { Stack, Slot } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../src/store/authStore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { User } from '../src/types/auth';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { setupNotifications, registerForPushNotificationsAsync } from './lib/notifications';

export default function RootLayout() {
  const { setUser, setLoading, isLoading } = useAuthStore();

  useEffect(() => {
    // Setup notifications
    setupNotifications();

    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = {
              ...userDoc.data(),
              id: firebaseUser.uid,
            } as User;
            setUser(userData);

            // Register for push notifications
            const token = await registerForPushNotificationsAsync();
            if (token) {
              // Update user's push token in Firestore
              await updateDoc(doc(db, 'users', firebaseUser.uid), {
                pushToken: token,
              });
            }
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return <Slot />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});