import React from 'react';
import { View, Text } from 'react-native';

// This is a safety wrapper to prevent the app from crashing in Expo Go
// when native modules (like WebRTC) are missing.

export const StreamVideoMock = ({ children, client }: any) => {
    if (!client || client.isMock) {
        return (
            <View style={{ flex: 1, backgroundColor: '#1C1C1E', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <Text style={{ color: '#FFD60A', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
                    ⚠️ Running in Expo Go (No Native Support)
                </Text>
                <Text style={{ color: '#8E8E93', marginTop: 10, textAlign: 'center' }}>
                    Video calls are disabled in Expo Go. Build a Development Client to enable full video support.
                </Text>
                <View style={{ flex: 1, width: '100%' }}>
                    {children}
                </View>
            </View>
        );
    }

    // We import this dynamically/conditionally in the main file to avoid top-level crashes
    return <>{children}</>;
};

export class MockStreamVideoClient {
    isMock = true;
    constructor() {
        console.warn("StreamVideoClient is mocked because native modules are missing.");
    }
    call() { return { join: async () => { }, leave: async () => { } }; }
    connectUser() { return Promise.resolve(); }
    disconnectUser() { return Promise.resolve(); }
}
