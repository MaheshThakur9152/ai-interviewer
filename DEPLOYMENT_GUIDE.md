# Deployment Guide

## Prerequisites
1.  **Node.js**: v18+
2.  **Stream Account**: Get API Key and Secret from [GetStream.io](https://getstream.io).
3.  **Expo Go**: On your mobile device or Simulator.

## Environment Variables
Create a `.env` file in `backend/`:
```env
PORT=3000
STREAM_API_KEY=your_api_key
STREAM_API_SECRET=your_api_secret
```

## Running the Backend
1.  Navigate to `backend`:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the server:
    ```bash
    npm run start
    # OR for dev
    npm run dev
    ```
    Server runs on `http://localhost:3000`.

## Running the Mobile App
1.  Navigate to `mobile-app`:
    ```bash
    cd mobile-app
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start Expo:
    ```bash
    npx expo start
    ```
4.  Scan the QR code with your phone or press `i` for iOS Simulator / `a` for Android.

## Troubleshooting
- **Network Error**: Ensure your phone handles the local backend URL. Modify `src/services/api.ts` with your machine's local IP (e.g., `192.168.1.X:3000`) instead of localhost.
- **Stream Auth Error**: Verify API Key and Secret in Backend `.env`.
