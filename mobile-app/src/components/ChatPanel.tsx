import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Channel, MessageList, MessageInput, useChatContext } from 'stream-chat-react-native';
import { theme } from '../theme/theme';

interface ChatPanelProps {
    channelId: string;
    onClose: () => void;
}

export default function ChatPanel({ channelId, onClose }: ChatPanelProps) {
    const { client } = useChatContext();
    const [channel, setChannel] = useState<any>(null);

    useEffect(() => {
        const initChannel = async () => {
            const newChannel = client.channel('messaging', channelId, {
                name: `Meeting: ${channelId}`,
            } as any);
            await newChannel.watch();
            setChannel(newChannel);
        };

        initChannel();
    }, [channelId]);

    if (!channel) return (
        <View style={styles.container}>
            <Text style={{ color: '#fff' }}>Loading Chat...</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Meeting Chat</Text>
                <TouchableOpacity onPress={onClose}>
                    <Text style={{ color: '#fff' }}>✕</Text>
                </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
                <Channel channel={channel}>
                    <MessageList />
                    <MessageInput />
                </Channel>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60,
        bottom: 100,
        right: 20,
        width: 320,
        backgroundColor: 'rgba(28, 28, 30, 0.98)',
        borderRadius: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        zIndex: 200,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#333'
    },
    title: { color: '#fff', fontWeight: 'bold' }
});
