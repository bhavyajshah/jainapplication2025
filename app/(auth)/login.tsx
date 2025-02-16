import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuthStore } from '../../src/store/authStore';
import { User, UserRole } from '../../src/types/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setLoading, setUser } = useAuthStore();

  const handleLogin = async () => {
    try {
      setLoading(true);

      // Check if it's admin credentials
      if (email === 'admin@jainpathshala.com' && password === 'admin@1234') {
        try {
          // Try to sign in first
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const adminUser: User = {
            id: userCredential.user.uid,
            email: email,
            role: 'admin' as UserRole,
            name: 'Admin',
            createdAt: new Date(),
            updatedAt: new Date(),
            // managedClasses: ['All']
          };

          // Update user in Firestore
          await setDoc(doc(db, 'users', userCredential.user.uid), adminUser);
          setUser(adminUser);
          router.replace('/(tabs)');
          return;
        } catch (signInError) {
          // If sign in fails, create the admin account
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const adminUser: User = {
            id: userCredential.user.uid,
            email: email,
            role: 'admin' as UserRole,
            name: 'Admin',
            createdAt: new Date(),
            updatedAt: new Date(),
            // managedClasses: ['All']
          };

          // Create user document in Firestore
          await setDoc(doc(db, 'users', userCredential.user.uid), adminUser);
          setUser(adminUser);
          router.replace('/(tabs)');
          return;
        }
      }

      // Handle regular user login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data() as unknown as User;
        setUser(userData);
        router.replace('/(tabs)');
      }
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}


          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.replace('/(auth)/register')}
          >
            <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    minHeight: 600,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  form: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  linkButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  linkText: {
    color: '#4A90E2',
    fontSize: 14,
  },
});