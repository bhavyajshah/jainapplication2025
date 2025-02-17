import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function CreateNotificationScreen() {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSendNotification = async () => {
        if (!title || !message) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            setLoading(true);
            const notificationData = {
                title,
                message,
                type: 'announcement',
                createdAt: serverTimestamp(),
                read: false,
            };

            // If no specific students selected, send to all
            if (selectedStudents.length === 0) {
                const studentsRef = collection(db, 'users');
                // Add notification for each student
                await addDoc(collection(db, 'notifications'), {
                    ...notificationData,
                    studentId: 'all',
                });
            } else {
                // Add notification for selected students
                for (const studentId of selectedStudents) {
                    await addDoc(collection(db, 'notifications'), {
                        ...notificationData,
                        studentId,
                    });
                }
            }

            Alert.alert('Success', 'Notification sent successfully');
            router.back();
        } catch (error) {
            console.error('Error sending notification:', error);
            Alert.alert('Error', 'Failed to send notification');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Create Notification</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Title</Text>
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Enter notification title"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Message</Text>
                    <TextInput
                        style={[styles.input, styles.messageInput]}
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Enter notification message"
                        multiline
                        numberOfLines={4}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.sendButton, loading && styles.buttonDisabled]}
                    onPress={handleSendNotification}
                    disabled={loading}
                >
                    <Ionicons name="send" size={24} color="white" />
                    <Text style={styles.sendButtonText}>
                        {loading ? 'Sending...' : 'Send Notification'}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        backgroundColor: 'white',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    form: {
        padding: 16,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    messageInput: {
        height: 120,
        textAlignVertical: 'top',
    },
    sendButton: {
        backgroundColor: '#4CAF50',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        marginTop: 16,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    sendButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});