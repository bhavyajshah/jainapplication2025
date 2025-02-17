import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

// Only import AsyncStorage and getReactNativePersistence on non-web platforms
let initializeAuthWithPersistence: ((app: any) => any) | undefined;
if (Platform.OS !== 'web') {
  const { getReactNativePersistence, initializeAuth } = require('firebase/auth');
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  initializeAuthWithPersistence = (app) =>
    initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
}

const firebaseConfig = {
  apiKey: "AIzaSyDsC-CpFem3nkUqFWNcunLl9a_H5SPtgrE",
  authDomain: "jain-application-29111.firebaseapp.com",
  projectId: "jain-application-29111",
  storageBucket: "jain-application-29111.firebasestorage.app",
  messagingSenderId: "692600396416",
  appId: "1:692600396416:web:01d53e0f1f5a102d176465",
  measurementId: "G-T0MJHWV6WF"
};

export const app = initializeApp(firebaseConfig);
export const auth = Platform.OS === 'web' ? getAuth(app) : initializeAuthWithPersistence?.(app) ?? getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default { app, auth, db, storage };