import React, { createContext, useContext, useState, useEffect } from 'react';
import { StreamVideoClient, StreamVideo } from '@stream-io/video-react-native-sdk';
import { MockStreamVideoClient } from '../utils/StreamMock';
import { StreamChat } from 'stream-chat';
import { Chat, OverlayProvider } from 'stream-chat-react-native';
import { api } from '../services/api';

type AuthContextType = {
    user: any;
    login: (userId: string, name: string) => Promise<void>;
    logout: () => void;
    videoClient: StreamVideoClient | null;
    chatClient: StreamChat | null;
    isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType>({} as any);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
    const [chatClient, setChatClient] = useState<StreamChat | null>(null);

    const login = async (userId: string, name: string) => {
        try {
            const data = await api.login(userId, name);
            const { token, apiKey } = data;

            // Init Chat
            const chat = StreamChat.getInstance(apiKey);
            await chat.connectUser({ id: userId, name }, token);
            setChatClient(chat);

            // Init Video
            const userObj = { id: userId, name };
            let video;
            try {
                video = new StreamVideoClient({ apiKey, user: userObj, token });
            } catch (e) {
                console.warn("Falling back to Mock Video Client", e);
                video = new MockStreamVideoClient() as any;
            }
            setVideoClient(video);

            setUser(userObj);
        } catch (e) {
            console.error("Login Failed", e);
            throw e;
        }
    };

    const logout = async () => {
        if (chatClient) await chatClient.disconnectUser();
        if (videoClient) await videoClient.disconnectUser();
        setUser(null);
        setVideoClient(null);
        setChatClient(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, videoClient, chatClient, isAuthenticated: !!user }}>
            {user && videoClient && chatClient ? (
                <OverlayProvider>
                    <Chat client={chatClient} enableOfflineSupport>
                        {videoClient && (videoClient as any).isMock ? (
                            children
                        ) : (
                            <StreamVideo client={videoClient}>
                                {children}
                            </StreamVideo>
                        )}
                    </Chat>
                </OverlayProvider>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
