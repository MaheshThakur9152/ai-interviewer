# Architecture Documentation

## Overview
FaceTime AI is a unified video calling and collaboration platform built with React Native (Expo) and Node.js. It leverages Stream Video and Chat SDKs for core communication and integrates AI for transcription and insights.

## Tech Stack
- **Frontend**: React Native (Expo SDK 54), TypeScript, Stream Video RN SDK, Stream Chat RN SDK.
- **Backend**: Node.js, Express, TypeScript.
- **AI**: Ollama (Interfaced), Deepgram (Planned for Transcription).
- **Styling**: Custom Theme (Glassmorphism), `expo-linear-gradient`.

## Directory Structure
```
/
├── backend/            # Express Server
│   ├── src/
│   │   ├── index.ts    # Entry point & Auth Endpoints
│   └── dist/           # Compiled JS
├── mobile-app/         # React Native App
│   ├── src/
│   │   ├── components/ # Reusable UI
│   │   ├── context/    # Auth & State Management
│   │   ├── screens/    # App Screens (Login, Home, Call)
│   │   ├── services/   # API Integration
│   │   ├── theme/      # Design Tokens
│   ├── App.tsx         # Main Navigator
```

## Key Components

### AuthProvider (`src/context/AuthContext.tsx`)
Manages user session and initializes `StreamVideoClient` and `StreamChat` clients upon login. It wraps the app with necessary providers.

### CallScreen (`src/screens/CallScreen.tsx`)
Uses `StreamCall` and `CallContent` to render video. It overlays a custom AI Control Panel for interacting with transcriptions and generating insights.

### Backend Auth (`backend/src/index.ts`)
Generates secure tokens using `StreamClient` secret. This ensures the frontend doesn't expose the Master Secret.

## Data Flow
1.  **User Login**: Frontend sends UserID -> Backend.
2.  **Token Generation**: Backend uses Secret to sign token -> returns to Frontend.
3.  **Connection**: Frontend connects to Stream Edge Network using Token.
4.  **AI**: Frontend/Backend sends audio/text to AI Service -> result displayed in Overlay.

## Future Improvements
- **Live Transcription**: Hook into Stream's audio capability or recording webhook to feed data to Whisper/Deepgram.
- **Push Notifications**: Expo Notifications integration.
- **Deep Linking**: Invite links using Expo Router.
