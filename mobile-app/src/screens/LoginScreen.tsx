import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

export default function LoginScreen() {
    const { login } = useAuth();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!name) return;
        setLoading(true);
        try {
            const userId = name.toLowerCase().replace(/\s/g, '_') + '_' + Math.floor(Math.random() * 1000);
            await login(userId, name);
        } catch (e) {
            alert("Login Failed. Check backend.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#000000', '#1A1A2E', '#0B1026']}
                style={StyleSheet.absoluteFill}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <View style={styles.logoCircle}>
                    <Text style={styles.logoEmoji}>📡</Text>
                </View>

                <Text style={styles.title}>FaceTime AI</Text>
                <Text style={styles.subtitle}>Collaborative Intelligence.</Text>

                <BlurView intensity={20} tint="light" style={styles.glassCard}>
                    <Text style={styles.label}>FULL NAME</Text>
                    <TextInput
                        placeholder="John Doe"
                        placeholderTextColor="#444"
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        autoCorrect={false}
                    />

                    <TouchableOpacity
                        style={[styles.button, !name && { opacity: 0.5 }]}
                        onPress={handleLogin}
                        disabled={loading || !name}
                    >
                        <LinearGradient
                            colors={['#0A84FF', '#0055D4']}
                            style={styles.btnGradient}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Join Experience</Text>}
                        </LinearGradient>
                    </TouchableOpacity>
                </BlurView>

                <View style={styles.featureRow}>
                    <View style={styles.feature}>
                        <Text style={styles.featureIcon}>✨</Text>
                        <Text style={styles.featureText}>Notes</Text>
                    </View>
                    <View style={styles.feature}>
                        <Text style={styles.featureIcon}>🎨</Text>
                        <Text style={styles.featureText}>Mood</Text>
                    </View>
                    <View style={styles.feature}>
                        <Text style={styles.featureIcon}>🤖</Text>
                        <Text style={styles.featureText}>AI Chat</Text>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    logoEmoji: { fontSize: 50 },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        letterSpacing: -1
    },
    subtitle: {
        fontSize: 16,
        color: '#8E8E93',
        marginBottom: 40,
        textAlign: 'center'
    },
    glassCard: {
        width: '100%',
        padding: 24,
        borderRadius: 30,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.05)'
    },
    label: {
        color: '#8E8E93',
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 8,
        letterSpacing: 1
    },
    input: {
        height: 56,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 16,
        color: '#fff',
        paddingHorizontal: 20,
        marginBottom: 20,
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    },
    button: {
        height: 56,
        borderRadius: 16,
        overflow: 'hidden',
    },
    btnGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: 'bold',
    },
    featureRow: {
        flexDirection: 'row',
        marginTop: 50,
        gap: 20
    },
    feature: {
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 12,
        borderRadius: 20,
        width: 80,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    },
    featureIcon: { fontSize: 24, marginBottom: 4 },
    featureText: { color: '#8E8E93', fontSize: 10, fontWeight: '600' }
});
