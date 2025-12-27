import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { api } from '../services/api';

export default function HomeScreen() {
    const { videoClient, logout } = useAuth();
    const navigation = useNavigation<any>();
    const [callId, setCallId] = useState('');
    const [testingAI, setTestingAI] = useState(false);

    const startNewCall = async () => {
        if (!videoClient) return;
        const newCallId = 'call-' + Math.random().toString(36).substring(7);
        navigation.navigate('Call', { callId: newCallId });
    };

    const joinCall = async () => {
        if (!videoClient || !callId) return;
        navigation.navigate('Call', { callId });
    };

    const testAIConnection = async () => {
        setTestingAI(true);
        try {
            const notesResult = await api.generateNotes("Test transcript for connection check");
            const moodboardResult = await api.generateMoodboard("test");

            Alert.alert(
                "✅ AI Backend Connected!",
                `Notes: ${notesResult.summary}\n\nMoodboard: ${moodboardResult.images.length} images generated`,
                [{ text: "OK" }]
            );
        } catch (e: any) {
            Alert.alert(
                "❌ Connection Failed",
                `Could not reach backend at http://10.0.2.2:3000\n\nError: ${e.message}`,
                [{ text: "OK" }]
            );
        } finally {
            setTestingAI(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#000', '#111']} style={StyleSheet.absoluteFill} />

            <View style={styles.header}>
                <Text style={styles.title}>FaceTime <Text style={{ color: theme.colors.primary }}>AI</Text></Text>
                <TouchableOpacity onPress={logout}>
                    <Text style={styles.signOut}>Sign Out</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.heroCard} onPress={startNewCall}>
                <LinearGradient colors={['#0A84FF', '#0055D4']} style={styles.heroGradient}>
                    <Text style={styles.heroIcon}>🎥</Text>
                    <View>
                        <Text style={styles.heroTitle}>New FaceTime</Text>
                        <Text style={styles.heroSubtitle}>Start an AI-powered session</Text>
                    </View>
                </LinearGradient>
            </TouchableOpacity>

            <View style={styles.card}>
                <Text style={styles.cardLabel}>JOIN EXISTING</Text>
                <View style={styles.joinRow}>
                    <TextInput
                        placeholder="Enter Call ID"
                        placeholderTextColor="#444"
                        style={styles.input}
                        value={callId}
                        onChangeText={setCallId}
                    />
                    <TouchableOpacity style={styles.joinBtn} onPress={joinCall}>
                        <Text style={styles.joinBtnText}>Join</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.tools}>
                <TouchableOpacity style={styles.toolBtn} onPress={() => navigation.navigate('History')}>
                    <Text style={styles.toolIcon}>📜</Text>
                    <Text style={styles.toolText}>History</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.toolBtn} onPress={testAIConnection} disabled={testingAI}>
                    {testingAI ? <ActivityIndicator color="#fff" /> : (
                        <>
                            <Text style={styles.toolIcon}>✨</Text>
                            <Text style={styles.toolText}>Test AI</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 25, paddingTop: 70 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
    signOut: { color: theme.colors.destructive, fontSize: 15 },
    heroCard: { borderRadius: 25, overflow: 'hidden', marginBottom: 25 },
    heroGradient: { padding: 25, flexDirection: 'row', alignItems: 'center', gap: 20 },
    heroIcon: { fontSize: 40 },
    heroTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    heroSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
    card: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    cardLabel: { color: '#444', fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 15 },
    joinRow: { flexDirection: 'row', gap: 15 },
    input: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 14, height: 54, paddingHorizontal: 16, color: '#fff', fontSize: 16 },
    joinBtn: { backgroundColor: '#30D158', paddingHorizontal: 20, borderRadius: 14, justifyContent: 'center' },
    joinBtnText: { color: '#fff', fontWeight: 'bold' },
    tools: { flexDirection: 'row', gap: 15, marginTop: 25 },
    toolBtn: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)'
    },
    toolIcon: { fontSize: 24, marginBottom: 8 },
    toolText: { color: '#fff', fontSize: 14, fontWeight: '600' }
});
