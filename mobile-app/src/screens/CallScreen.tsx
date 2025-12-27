import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions, ScrollView, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { StreamCall, useStreamVideoClient, Call, CallContent } from '@stream-io/video-react-native-sdk';
import { useRoute, useNavigation } from '@react-navigation/native';
import { theme } from '../theme/theme';
import { api, API_URL } from '../services/api';
import { storage } from '../services/storage';
import ChatPanel from '../components/ChatPanel';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

export default function CallScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const client = useStreamVideoClient();
    const { callId } = route.params;
    const [call, setCall] = useState<Call | null>(null);

    // Panels State
    const [activePanel, setActivePanel] = useState<'none' | 'ai' | 'chat' | 'moodboard'>('none');
    const [isRecording, setIsRecording] = useState(false);

    // AI & Transcription State
    const [transcript, setTranscript] = useState("Meeting started. Listening...");
    const [summary, setSummary] = useState<any>(null);
    const [loadingAI, setLoadingAI] = useState(false);

    // AI Chat State
    const [aiChatMessages, setAiChatMessages] = useState<any[]>([]);
    const [aiInput, setAiInput] = useState("");
    const scrollViewRef = useRef<ScrollView>(null);

    // Moodboard State
    const [mbPrompt, setMbPrompt] = useState("");
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);

    // 1. Initial Load & Join Call
    useEffect(() => {
        if (!client || !callId) return;

        // Load persisted data
        const loadPersisted = async () => {
            const savedNotes = await storage.getMeetingNotes(callId);
            if (savedNotes) setSummary(savedNotes);

            const savedImages = await storage.getCallImages(callId);
            if (savedImages.length > 0) setGeneratedImages(savedImages);

            const savedTranscript = await storage.getTranscript(callId);
            if (savedTranscript) setTranscript(savedTranscript);
        };
        loadPersisted();

        if ((client as any).isMock) {
            setCall({ id: callId } as any);
            return;
        }

        const myCall = client.call('default', callId);
        myCall.join({ create: true }).then(() => {
            setCall(myCall);
        }).catch(err => {
            console.error("Failed to join call", err);
            navigation.goBack();
        });

        return () => {
            if (myCall) myCall.leave();
        };
    }, [client, callId]);

    // 2. Simulated real-time transcript
    useEffect(() => {
        const phrases = [
            "We need to discuss the Q1 roadmap.",
            "Can the AI handle real-time annotations?",
            "The moodboard should look futuristic.",
            "Let's stick to the current project timeline.",
            "I'll share the API keys later."
        ];
        let i = 0;
        const interval = setInterval(() => {
            if (i < phrases.length) {
                setTranscript(prev => {
                    const next = prev + "\n" + phrases[i];
                    storage.saveTranscript(callId, next); // Save periodically
                    return next;
                });
                i++;
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [callId]);

    const onHangup = async () => {
        if (call && (call as any).leave) await call.leave();
        navigation.goBack();
    };

    const handleGenerateSummary = async () => {
        setLoadingAI(true);
        try {
            const res = await api.generateNotes(transcript);
            setSummary(res);
            await storage.saveMeetingNotes(callId, res);
            await storage.saveMeetingToHistory(callId, res.summary);
        } catch (e) {
            console.error(e);
            alert("AI Error. Is backend running?");
        } finally {
            setLoadingAI(false);
        }
    };

    const handleGenerateImages = async () => {
        if (!mbPrompt) return;
        setLoadingAI(true);
        try {
            const data = await api.generateMoodboard(mbPrompt);
            setGeneratedImages(prev => {
                const updated = [...prev, ...data.images];
                storage.saveGeneratedImages(callId, data.images);
                return updated;
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingAI(false);
        }
    };

    const handleSendAiMessage = async () => {
        if (!aiInput.trim()) return;
        const userMsg = { sender: 'user', text: aiInput };
        setAiChatMessages(prev => [...prev, userMsg]);
        const currentInput = aiInput;
        setAiInput("");
        setLoadingAI(true);

        try {
            const res = await api.chatAI(currentInput, aiChatMessages);
            setAiChatMessages(prev => [...prev, { sender: 'ai', text: res.response }]);
        } catch (e) {
            setAiChatMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I'm having trouble connecting to my brain." }]);
        } finally {
            setLoadingAI(false);
            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        }
    };

    if (!call) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={{ color: 'white', marginTop: 10 }}>Establishing connection...</Text>
            </View>
        );
    }

    const renderPanel = () => {
        if (activePanel === 'none') return null;

        return (
            <BlurView intensity={90} tint="dark" style={styles.panel}>
                <View style={styles.panelHeader}>
                    <Text style={styles.panelTitle}>
                        {activePanel === 'ai' ? 'AI Assistant' : activePanel === 'moodboard' ? 'Moodboard' : 'Call Chat'}
                    </Text>
                    <TouchableOpacity onPress={() => setActivePanel('none')}>
                        <Text style={{ color: '#fff', fontSize: 18 }}>✕</Text>
                    </TouchableOpacity>
                </View>

                {activePanel === 'ai' && (
                    <View style={{ flex: 1 }}>
                        <View style={styles.tabs}>
                            <TouchableOpacity style={[styles.tab, !summary && styles.activeTab]} onPress={() => setSummary(null)}>
                                <Text style={styles.tabText}>Assistant</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.tab, summary && styles.activeTab]} onPress={handleGenerateSummary}>
                                <Text style={styles.tabText}>Notes</Text>
                            </TouchableOpacity>
                        </View>

                        {!summary ? (
                            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                                <ScrollView ref={scrollViewRef} style={styles.chatScroll} contentContainerStyle={{ paddingBottom: 20 }}>
                                    <View style={styles.transcriptSmall}>
                                        <Text style={styles.label}>Live Transcript Snapshot</Text>
                                        <Text style={{ color: '#888', fontSize: 12 }}>{transcript.slice(-150)}</Text>
                                    </View>

                                    {aiChatMessages.map((msg, idx) => (
                                        <View key={idx} style={[styles.msgBox, msg.sender === 'user' ? styles.userMsg : styles.aiMsg]}>
                                            <Text style={styles.msgText}>{msg.text}</Text>
                                        </View>
                                    ))}
                                    {loadingAI && <ActivityIndicator color={theme.colors.primary} style={{ alignSelf: 'flex-start' }} />}
                                </ScrollView>
                                <View style={styles.inputRow}>
                                    <TextInput
                                        style={styles.chatInput}
                                        placeholder="Ask AI anything..."
                                        placeholderTextColor="#666"
                                        value={aiInput}
                                        onChangeText={setAiInput}
                                        onSubmitEditing={handleSendAiMessage}
                                    />
                                    <TouchableOpacity style={styles.sendBtn} onPress={handleSendAiMessage}>
                                        <Text>🚀</Text>
                                    </TouchableOpacity>
                                </View>
                            </KeyboardAvoidingView>
                        ) : (
                            <ScrollView>
                                <View style={styles.summaryCard}>
                                    <Text style={styles.summaryTitle}>Summary</Text>
                                    <Text style={styles.summaryText}>{summary.summary}</Text>
                                    <Text style={styles.summaryTitle}>Action Items</Text>
                                    {summary.action_items?.map((item: string, i: number) => (
                                        <Text key={i} style={styles.actionItem}>• {item}</Text>
                                    ))}
                                </View>
                                <TouchableOpacity style={styles.actionBtn} onPress={() => setSummary(null)}>
                                    <Text style={styles.btnText}>Back to Chat</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        )}
                    </View>
                )}

                {activePanel === 'moodboard' && (
                    <View style={{ flex: 1 }}>
                        <TextInput
                            style={styles.input}
                            placeholder="Prompt: Cyberpunk office..."
                            placeholderTextColor="#666"
                            value={mbPrompt}
                            onChangeText={setMbPrompt}
                        />
                        <TouchableOpacity style={styles.actionBtn} onPress={handleGenerateImages} disabled={loadingAI}>
                            {loadingAI ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Generate Visions</Text>}
                        </TouchableOpacity>

                        <ScrollView horizontal style={{ marginTop: 20 }}>
                            {generatedImages.map((uri, i) => (
                                <TouchableOpacity key={i} onPress={() => navigation.navigate('Annotation', { imageUri: uri })}>
                                    <Image source={{ uri }} style={styles.generatedImage} />
                                    <View style={styles.annotateLabel}>
                                        <Text style={{ color: '#fff', fontSize: 10 }}>🎨 Annotate</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}
            </BlurView>
        );
    };

    const callContent = (
        <View style={styles.container}>
            {(client as any).isMock ? (
                <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#FFD60A', fontSize: 24, marginBottom: 20 }}>🎥 Pro AI Video</Text>
                    <Text style={{ color: '#8E8E93', textAlign: 'center', paddingHorizontal: 40 }}>
                        Real-time video streaming active in production build.
                    </Text>
                    <TouchableOpacity style={styles.hangupBtn} onPress={onHangup}>
                        <Text style={{ color: '#fff', fontSize: 24 }}>🛑</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <CallContent
                    onHangupCallHandler={onHangup}
                />
            )}

            {/* Header */}
            <View style={styles.headerOverlay}>
                <LinearGradient colors={['rgba(0,0,0,0.8)', 'transparent']} style={StyleSheet.absoluteFill} />
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>{callId}</Text>
                        <Text style={styles.headerSubtitle}>Gemini 2.5 Flash Session</Text>
                    </View>
                    <View style={styles.badgeRow}>
                        <View style={styles.recordingBadge(isRecording)}>
                            <View style={styles.dot(isRecording)} />
                            <Text style={{ color: '#fff', fontSize: 12 }}>{isRecording ? 'REC' : 'LIVE'}</Text>
                        </View>
                        <TouchableOpacity onPress={onHangup} style={styles.closeBtn}>
                            <Text style={{ color: '#fff' }}>✕</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Sidebar Actions */}
            <View style={styles.sidebar}>
                <TouchableOpacity
                    style={[styles.sideBtn, activePanel === 'ai' && styles.activeSideBtn]}
                    onPress={() => setActivePanel(activePanel === 'ai' ? 'none' : 'ai')}
                >
                    <Text style={styles.sideIcon}>✨</Text>
                    <Text style={styles.sideLabel}>AI</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.sideBtn, activePanel === 'moodboard' && styles.activeSideBtn]}
                    onPress={() => setActivePanel(activePanel === 'moodboard' ? 'none' : 'moodboard')}
                >
                    <Text style={styles.sideIcon}>🎨</Text>
                    <Text style={styles.sideLabel}>Mood</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.sideBtn, activePanel === 'chat' && styles.activeSideBtn]}
                    onPress={() => setActivePanel(activePanel === 'chat' ? 'none' : 'chat')}
                >
                    <Text style={styles.sideIcon}>💬</Text>
                    <Text style={styles.sideLabel}>Chat</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.sideBtn, isRecording && { borderColor: 'red' }]}
                    onPress={() => setIsRecording(!isRecording)}
                >
                    <Text style={[styles.sideIcon, isRecording && { color: 'red' }]}>⏺</Text>
                    <Text style={styles.sideLabel}>{isRecording ? 'Stop' : 'Rec'}</Text>
                </TouchableOpacity>
            </View>

            {activePanel === 'chat' && (
                <ChatPanel channelId={callId} onClose={() => setActivePanel('none')} />
            )}

            {renderPanel()}
        </View>
    );

    if ((client as any).isMock) {
        return callContent;
    }

    return (
        <StreamCall call={call}>
            {callContent}
        </StreamCall>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    loadingContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
    headerOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 120,
        zIndex: 10,
        paddingTop: 60,
        paddingHorizontal: 20
    },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    headerSubtitle: { color: '#888', fontSize: 12 },
    badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    sidebar: {
        position: 'absolute',
        right: 20,
        top: 140,
        zIndex: 20,
        gap: 15
    },
    sideBtn: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(28, 28, 30, 0.7)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeSideBtn: {
        backgroundColor: theme.colors.primary,
        borderColor: '#fff'
    },
    sideIcon: { fontSize: 24, color: '#fff' },
    sideLabel: { color: '#fff', fontSize: 10, marginTop: 2 },
    panel: {
        position: 'absolute',
        bottom: 110,
        left: 20,
        right: 90,
        height: 480,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        padding: 16,
        zIndex: 100
    },
    panelHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    panelTitle: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    tabs: { flexDirection: 'row', marginBottom: 15, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 4 },
    tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
    activeTab: { backgroundColor: 'rgba(255,255,255,0.1)' },
    tabText: { color: '#fff', fontWeight: '600', fontSize: 13 },
    chatScroll: { flex: 1 },
    transcriptSmall: { backgroundColor: 'rgba(0,0,0,0.2)', padding: 8, borderRadius: 8, marginBottom: 15 },
    label: { color: '#666', fontSize: 10, marginBottom: 4, textTransform: 'uppercase' },
    msgBox: { padding: 10, borderRadius: 16, marginBottom: 8, maxWidth: '85%' },
    userMsg: { alignSelf: 'flex-end', backgroundColor: theme.colors.primary },
    aiMsg: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.1)' },
    msgText: { color: '#fff', fontSize: 14 },
    inputRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
    chatInput: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 12, color: '#fff' },
    sendBtn: { width: 44, height: 44, backgroundColor: theme.colors.primary, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    summaryCard: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 16 },
    summaryTitle: { color: theme.colors.primary, fontWeight: 'bold', marginTop: 10, marginBottom: 5 },
    summaryText: { color: '#ddd', lineHeight: 20 },
    actionItem: { color: '#bbb', marginBottom: 4 },
    actionBtn: { backgroundColor: theme.colors.primary, padding: 14, borderRadius: 14, alignItems: 'center', marginTop: 15 },
    btnText: { color: '#fff', fontWeight: 'bold' },
    input: { backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff', padding: 14, borderRadius: 14, marginBottom: 10 },
    generatedImage: { width: 120, height: 160, borderRadius: 16, marginRight: 12, backgroundColor: '#222' },
    annotateLabel: { position: 'absolute', bottom: 10, left: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', padding: 4, borderRadius: 8, alignItems: 'center' },
    recordingBadge: (active: boolean) => ({
        flexDirection: 'row', alignItems: 'center', backgroundColor: active ? 'red' : 'rgba(255,255,255,0.1)',
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12
    }),
    dot: (active: boolean) => ({ width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff', marginRight: 6, opacity: active ? 1 : 0.5 }),
    hangupBtn: { marginTop: 40, width: 60, height: 60, borderRadius: 30, backgroundColor: 'red', justifyContent: 'center', alignItems: 'center' }
} as any);
