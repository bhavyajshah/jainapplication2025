import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'web') {
    return null;
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return null;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

export async function sendNotification(title: string, body: string, data: any = {}, studentIds: string[] = []) {
  try {
    const notification = {
      title,
      message: body,
      data,
      createdAt: serverTimestamp(),
      read: false,
    };

    if (studentIds.length === 0) {
      // Send to all students
      await addDoc(collection(db, 'notifications'), {
        ...notification,
        studentId: 'all',
      });
    } else {
      // Send to specific students
      for (const studentId of studentIds) {
        await addDoc(collection(db, 'notifications'), {
          ...notification,
          studentId,
        });
      }
    }

    // If using Expo push notifications service
    if (Platform.OS !== 'web') {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
        },
        trigger: null,
      });
    }

    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}

export function setupNotifications() {
  if (Platform.OS === 'web') return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

// Default export for the notifications module
export default {
  registerForPushNotificationsAsync,
  sendNotification,
  setupNotifications,
};