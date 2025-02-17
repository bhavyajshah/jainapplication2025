import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
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
  const { setLoading } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setLoading(true);

      // Check if it's admin credentials
      if (email === 'admin@jainpathshala.com' && password === 'admin@1234') {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const adminUser: User = {
            id: userCredential.user.uid,
            email: email,
            role: 'admin' as UserRole,
            name: 'Admin',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await setDoc(doc(db, 'users', userCredential.user.uid), adminUser);
          router.replace('/admin/dashboard' as any);
          return;
        } catch (signInError) {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const adminUser: User = {
            id: userCredential.user.uid,
            email: email,
            role: 'admin' as UserRole,
            name: 'Admin',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await setDoc(doc(db, 'users', userCredential.user.uid), adminUser);
          return; // Let auth state change handle navigation
        }
      }

      // Handle regular user login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Let auth state change handle navigation

    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsSubmitting(false);
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
            editable={!isSubmitting}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isSubmitting}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}


          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.replace('/(auth)/register')}
            disabled={isSubmitting}
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
  buttonDisabled: {
    opacity: 0.7,
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