# FaceTime-style AI Powered Video Calling App - Implementation Plan

## 1. Project Structure
- **/mobile-app**: React Native (Expo) application.
- **/backend**: Node.js/Express application with TypeScript.

## 2. Backend Development (Node/Express)
- **Setup**: Initialize `npm`, TypeScript, Express.
- **Dependencies**: `stream-chat`, `@stream-io/node-sdk`, `cors`, `dotenv`, `express`.
- **Endpoints**:
    - `POST /auth/login`: Generate user tokens for Stream Video and Chat.
    - `POST /transcribe`: webhook or stream for audio transcription (Deepgram/Whisper).
    - `POST /ai/generate-notes`: Call Ollama for meeting notes.
    - `POST /ai/generate-image`: Call Ollama/Image model for moodboard.

## 3. Mobile App Development (React Native)
- **Dependencies**: 
    - `@stream-io/video-react-native-sdk` (Installed)
    - `stream-chat-react-native`
    - `@react-navigation/native`
    - `expo-av` (for audio capture if needed individually, though Stream handles call audio, we might need separate capture for pure transcription if not using Stream's recording hooks)
    - `lucide-react-native` (Icons)
- **Navigation**:
    - `AuthScreen`: Simple user entry.
    - `HomeScreen`: Start/Join meeting.
    - `CallScreen`: active video call.
- **Features**:
    - **Video Call**: Grid/Speaker view, PIP, custom controls.
    - **Chat Overlay**: Stream Chat UI.
    - **Live Transcript**: WebSocket or polling from backend (simulated for MVP if needed).
    - **Moodboard**: Image generation and annotation.
    - **Controls**: Glassmorphism UI.

## 4. Execution Steps
1.  **Backend Init**: Setup basic server and Token generation.
2.  **Frontend Auth**: Connect to backend to get token and login to Stream.
3.  **Video Call**: Implement basics (Join/Start).
4.  **Chat Integration**: Add chat to the call screen.
5.  **AI Services**: Connect backend to AI stubs/APIs.
6.  **UI Polish**: Glassmorphism, animations.

## 5. Constraints & Notes
- Use `Stream Video SDK` for all calls.
- Use `Stream Chat SDK` for messaging.
- Backend handles keys and token generation.
