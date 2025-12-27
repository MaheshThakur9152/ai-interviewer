import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { storage } from '../services/storage';
import { theme } from '../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

export default function HistoryScreen() {
    const navigation = useNavigation<any>();
    const [meetings, setMeetings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        const data = await storage.getMeetingsHistory();
        setMeetings(data);
        setLoading(false);
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Call', { callId: item.id })}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.callId}>{item.id}</Text>
                <Text style={styles.date}>{new Date(item.timestamp).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.summary} numberOfLines={2}>{item.summary}</Text>
            <View style={styles.footer}>
                <Text style={styles.footerText}>✨ AI Summary Available</Text>
                <Text style={styles.arrow}>→</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0F0F13', '#1C1C1E']} style={StyleSheet.absoluteFill} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={{ color: '#fff', fontSize: 24 }}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>History</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 100 }} />
            ) : (
                <FlatList
                    data={meetings}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyText}>No saved meetings yet.</Text>
                            <Text style={styles.emptySub}>Your AI summaries and notes will appear here.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    title: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginLeft: 10 },
    list: { padding: 20, gap: 15 },
    card: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    callId: { color: theme.colors.primary, fontWeight: 'bold', fontSize: 18 },
    date: { color: '#666', fontSize: 12 },
    summary: { color: '#ccc', fontSize: 14, lineHeight: 20, marginBottom: 12 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 10 },
    footerText: { color: theme.colors.primary, fontSize: 12, fontWeight: '600' },
    arrow: { color: '#fff', fontSize: 18 },
    empty: { marginTop: 100, alignItems: 'center', paddingHorizontal: 40 },
    emptyText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    emptySub: { color: '#666', textAlign: 'center', marginTop: 10 }
});
