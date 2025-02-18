import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    Platform,
} from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { sendNotification } from '../lib/notifications';

export default function CreateAnnouncementScreen() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
    const [loading, setLoading] = useState(false);

    const handleSendAnnouncement = async () => {
        if (!title || !content) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            setLoading(true);
            const announcementData = {
                title,
                content,
                priority,
                createdAt: serverTimestamp(),
            };

            // Add announcement to Firestore
            const docRef = await addDoc(collection(db, 'announcements'), announcementData);

            // Send notification
            await sendNotification(
                title,
                content,
                { announcementId: docRef.id, priority },
            );

            Alert.alert('Success', 'Announcement sent successfully');
            router.back();
        } catch (error) {
            console.error('Error sending announcement:', error);
            Alert.alert('Error', 'Failed to send announcement');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Create Announcement</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Title</Text>
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Enter announcement title"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Message</Text>
                    <TextInput
                        style={[styles.input, styles.messageInput]}
                        value={content}
                        onChangeText={setContent}
                        placeholder="Enter announcement message"
                        multiline
                        numberOfLines={4}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Priority</Text>
                    <View style={styles.priorityContainer}>
                        <TouchableOpacity
                            style={[
                                styles.priorityButton,
                                priority === 'high' && styles.priorityButtonActive,
                                { backgroundColor: priority === 'high' ? '#FFE5E5' : '#FFF' }
                            ]}
                            onPress={() => setPriority('high')}
                        >
                            <Ionicons name="alert-circle" size={24} color={priority === 'high' ? '#FF4444' : '#666'} />
                            <Text style={[
                                styles.priorityText,
                                priority === 'high' && { color: '#FF4444' }
                            ]}>High</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.priorityButton,
                                priority === 'medium' && styles.priorityButtonActive,
                                { backgroundColor: priority === 'medium' ? '#FFF3E0' : '#FFF' }
                            ]}
                            onPress={() => setPriority('medium')}
                        >
                            <Ionicons name="information-circle" size={24} color={priority === 'medium' ? '#FF9800' : '#666'} />
                            <Text style={[
                                styles.priorityText,
                                priority === 'medium' && { color: '#FF9800' }
                            ]}>Medium</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.priorityButton,
                                priority === 'low' && styles.priorityButtonActive,
                                { backgroundColor: priority === 'low' ? '#E8F5E9' : '#FFF' }
                            ]}
                            onPress={() => setPriority('low')}
                        >
                            <Ionicons name="checkmark-circle" size={24} color={priority === 'low' ? '#4CAF50' : '#666'} />
                            <Text style={[
                                styles.priorityText,
                                priority === 'low' && { color: '#4CAF50' }
                            ]}>Low</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.sendButton, loading && styles.buttonDisabled]}
                    onPress={handleSendAnnouncement}
                    disabled={loading}
                >
                    <Ionicons name="send" size={24} color="white" />
                    <Text style={styles.sendButtonText}>
                        {loading ? 'Sending...' : 'Send Announcement'}
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
    priorityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    priorityButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 12,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    priorityButtonActive: {
        borderWidth: 2,
    },
    priorityText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
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