import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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
export const auth = getAuth(app);
export const db = getFirestore(app);