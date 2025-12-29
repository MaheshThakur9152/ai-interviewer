import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface InterviewState {
  // Session State
  isSessionActive: boolean;
  currentTopic: string | null;
  currentQuestion: string | null;

  // Audio State
  isMicActive: boolean;
  isAudioPlaying: boolean; // AI is speaking
  volumeLevel: number; // For visualizer

  // Editor State
  code: string;
  language: string;
  isEditorFrozen: boolean;
  terminalOutput: { type: 'success' | 'error' | 'info', message: string } | null;

  // Chat State
  messages: Message[];

  // Actions
  startSession: (topic: string) => void;
  endSession: () => void;
  setMicActive: (active: boolean) => void;
  setAudioPlaying: (playing: boolean) => void;
  setVolumeLevel: (level: number) => void;
  setCode: (code: string) => void;
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  setTerminalOutput: (output: { type: 'success' | 'error' | 'info', message: string } | null) => void;
  setEditorFrozen: (frozen: boolean) => void;
}

export const useInterviewStore = create<InterviewState>()(
  persist(
    (set) => ({
      isSessionActive: false,
      currentTopic: null,
      currentQuestion: null,

      isMicActive: false,
      isAudioPlaying: false,
      volumeLevel: 0,

      code: '// Write your solution here\nconsole.log("Hello World");',
      language: 'javascript',
      isEditorFrozen: false,
      terminalOutput: null,

      messages: [],

      startSession: (topic) => set({
        isSessionActive: true,
        currentTopic: topic,
        messages: [{ role: 'system', content: `Starting ${topic} interview session...`, timestamp: Date.now() }]
      }),

      endSession: () => set({ isSessionActive: false, currentTopic: null }),

      setMicActive: (active) => set({ isMicActive: active }),
      setAudioPlaying: (playing) => set({ isAudioPlaying: playing }),
      setVolumeLevel: (level) => set({ volumeLevel: level }),

      setCode: (code) => set({ code }),

      addMessage: (role, content) => set((state) => ({
        messages: [...state.messages, { role, content, timestamp: Date.now() }]
      })),

      setTerminalOutput: (output) => set({ terminalOutput: output }),
      setEditorFrozen: (frozen) => set({ isEditorFrozen: frozen }),
    }),
    {
      name: 'interview-storage', // unique name
      partialize: (state) => ({
        code: state.code,
        messages: state.messages,
        currentTopic: state.currentTopic
      }), // only persist important data
    }
  )
);
