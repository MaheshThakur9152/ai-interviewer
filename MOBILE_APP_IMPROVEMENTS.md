# Mobile App Improvements Plan

## ✅ Completed Fixes

### 1. Kotlin Version & Build Configuration
- **Fixed**: Updated Kotlin from `1.9.24` to `2.1.21` in `app.json`
- **Fixed**: Updated `compileSdkVersion` from 34 to 35
- **Result**: Android builds successfully

### 2. WebRTC Native Modules  
- **Fixed**: Removed incorrect `NativeModules` check in `AuthContext.tsx`
- **Result**: StreamVideoClient properly initializes with native WebRTC

### 3. Gesture Handler Setup
- **Fixed**: Wrapped app with `GestureHandlerRootView` in `App.tsx`
- **Fixed**: Updated AnnotationScreen to use modern Gesture API instead of deprecated `useTouchHandler`
- **Result**: Gestures work throughout the app

---

## 🔨 Required Improvements

### 1. Fix Skia Annotation Screen (IN PROGRESS)

**Problem**: The AnnotationScreen still shows `useTouchHandler` error due to cached code

**Solution**: The code has been updated but needs cache clear. After running `npx expo start --clear`, the annotation should work.

**Files Modified**:
- `/home/mahesh/facetime/mobile-app/src/screens/AnnotationScreen.tsx`

**Changes Made**:
```typescript
// OLD (deprecated)
import { useTouchHandler } from '@shopify/react-native-skia';
const onTouch = useTouchHandler({...});
<Canvas onTouch={onTouch}>

// NEW (modern Gesture API)
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
const panGesture = Gesture.Pan()...
<GestureDetector gesture={panGesture}>
  <Canvas>
```

**Test**: After cache clear, open a moodboard image and try annotating on it.

---

### 2. Add Data Persistence

**What to Persist**:
1. Chat history (Stream Chat already persists server-side)
2. Meeting transcripts and AI-generated notes
3. Generated moodboard images
4. Annotation data

**Implementation**:

#### A. Install AsyncStorage
```bash
cd /home/mahesh/facetime/mobile-app
npx expo install @react-native-async-storage/async-storage
```

#### B. Create Storage Service

Create `/home/mahesh/facetime/mobile-app/src/services/storage.ts`:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  // Save meeting notes
  saveMeetingNotes: async (callId: string, notes: any) => {
    const key = `meeting_notes_${callId}`;
    await AsyncStorage.setItem(key, JSON.stringify(notes));
  },

  // Get meeting notes
  getMeetingNotes: async (callId: string) => {
    const key = `meeting_notes_${callId}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },

  // Save all meetings list
  saveMeetingToHistory: async (callId: string, summary: string) => {
    const key = 'meetings_history';
    const existing = await AsyncStorage.getItem(key);
    const meetings = existing ? JSON.parse(existing) : [];
    meetings.unshift({
      id: callId,
      summary,
      timestamp: new Date().toISOString()
    });
    await AsyncStorage.setItem(key, JSON.stringify(meetings.slice(0, 50))); // Keep last 50
  },

  // Get meetings history
  getMeetingsHistory: async () => {
    const data = await AsyncStorage.getItem('meetings_history');
    return data ? JSON.parse(data) : [];
  },

  // Save generated images
  saveGeneratedImage: async (callId: string, imageUri: string) => {
    const key = `images_${callId}`;
    const existing = await AsyncStorage.getItem(key);
    const images = existing ? JSON.parse(existing) : [];
    images.push(imageUri);
    await AsyncStorage.setItem(key, JSON.stringify(images));
  },

  // Get images for a call
  getCallImages: async (callId: string) => {
    const data = await AsyncStorage.getItem(`images_${callId}`);
    return data ? JSON.parse(data) : [];
  }
};
```

#### C. Update CallScreen to Persist Data

In `/home/mahesh/facetime/mobile-app/src/screens/CallScreen.tsx`:

```typescript
import { storage } from '../services/storage';

// After generating summary
const handleGenerateSummary = async () => {
  setLoadingAI(true);
  try {
    const res = await api.generateNotes(transcript);
    setSummary(res);
    
    // PERSIST THE NOTES
    await storage.saveMeetingNotes(callId, res);
    await storage.saveMeetingToHistory(callId, res.summary);
  } catch (e) {
    console.error(e);
  } finally {
    setLoadingAI(false);
  }
};

// After generating images
const handleGenerateImages = async () => {
  if (!mbPrompt) return;
  setLoadingAI(true);
  try {
    const res = await fetch(`${API_URL}/api/ai/moodboard`, {...});
    const data = await res.json();
    setGeneratedImages(data.images);
    
    // PERSIST THE IMAGES
    for (const img of data.images) {
      await storage.saveGeneratedImage(callId, img);
    }
  } catch (e) {
    console.error(e);
  } finally {
    setLoadingAI(false);
  }
};

// Load previous notes on mount
useEffect(() => {
  const loadPreviousNotes = async () => {
    const savedNotes = await storage.getMeetingNotes(callId);
    if (savedNotes) {
      setSummary(savedNotes);
    }
    
    const savedImages = await storage.getCallImages(callId);
    if (savedImages.length > 0) {
      setGeneratedImages(savedImages);
    }
  };
  loadPreviousNotes();
}, [callId]);
```

#### D. Create History Screen

Create `/home/mahesh/facetime/mobile-app/src/screens/HistoryScreen.tsx`:
```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { storage } from '../services/storage';
import { theme } from '../theme/theme';

export default function HistoryScreen({ navigation }) {
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const history = await storage.getMeetingsHistory();
    setMeetings(history);
  };

  const renderMeeting = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('MeetingDetail', { callId: item.id })}
    >
      <Text style={styles.title}>{item.id}</Text>
      <Text style={styles.summary} numberOfLines={2}>{item.summary}</Text>
      <Text style={styles.date}>
        {new Date(item.timestamp).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles header}>Meeting History</Text>
      <FlatList
        data={meetings}
        renderItem={renderMeeting}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 20 },
  header: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  list: { gap: 12 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder
  },
  title: { color: theme.colors.primary, fontSize: 18, fontWeight: '600' },
  summary: { color: '#ccc', marginTop: 8, fontSize: 14 },
  date: { color: '#666', marginTop: 8, fontSize: 12 }
});
```

Add to navigation in `App.tsx`:
```typescript
<Stack.Screen name="History" component={HistoryScreen} />
```

---

### 3. Modernize UI Design

#### A. Update Theme (`/home/mahesh/facetime/mobile-app/src/theme/theme.ts`)

```typescript
export const theme = {
  colors: {
    // Modern gradient backgrounds
    background: '#000000',
    backgroundGradient: ['#0A0A0A', '#1A1A2E', '#0F0F23'],
    
    // Vibrant accent colors
    primary: '#0A84FF', // iOS Blue
    primaryGlow: '#0A84FF33',
    secondary: '#30D158', // iOS Green
    accent: '#FF453A', // iOS Red
    warning: '#FFD60A', // iOS Yellow
    
    // Glassmorphism
    glassBg: 'rgba(28, 28, 30, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
    glassHighlight: 'rgba(255, 255, 255, 0.05)',
    
    // Text
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    textTertiary: '#48484A',
    
    // Status
    success: '#34C759',
    destructive: '#FF3B30',
    online: '#30D158',
    
    // Shadows & Glows
    shadow: '#00000080',
    glow: '#0A84FF40'
  },
  
  shadows: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8
    },
    glow: {
      shadowColor: '#0A84FF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 10
    }
  },
  
  animations: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500
    }
  }
};
```

#### B. Modernize Login Screen

Update `/home/mahesh/facetime/mobile-app/src/screens/LoginScreen.tsx`:

```typescript
import LinearGradient from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// In the JSX, replace the container:
<LinearGradient
  colors={theme.colors.backgroundGradient}
  style={styles.container}
>
  <BlurView intensity={20} style={styles.blur}>
    <View style={styles.content}>
      {/* Logo with glow effect */}
      <View style={[styles.logoContainer, theme.shadows.glow]}>
        <Text style={styles.logoEmoji}>🎥</Text>
      </View>
      
      <Text style={styles.title}>FaceTime AI</Text>
      <Text style={styles.subtitle}>
        AI-Powered Video Collaboration
      </Text>

      {/* Modern glassmorphic input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          placeholderTextColor={theme.colors.textSecondary}
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* Gradient button */}
      <TouchableOpacity onPress={handleLogin} disabled={loading}>
        <LinearGradient
          colors={['#0A84FF', '#0066CC']}
style={styles.button}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Start Meeting</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Feature badges */}
      <View style={styles.features}>
        <View style={styles.featureBadge}>
          <Text style={styles.featureIcon}>✨</Text>
          <Text style={styles.featureText}>AI Notes</Text>
        </View>
        <View style={styles.featureBadge}>
          <Text style={styles.featureIcon}>🎨</Text>
          <Text style={styles.featureText}>Moodboards</Text>
        </View>
        <View style={styles.featureBadge}>
          <Text style={styles.featureIcon}>📝</Text>
          <Text style={styles.featureText}>Annotations</Text>
        </View>
      </View>
    </View>
  </BlurView>
</LinearGradient>
```

Styles:
```typescript
const styles = StyleSheet.create({
  container: { flex: 1 },
  blur: { flex: 1, justifyContent: 'center' },
  content: { paddingHorizontal: 40, alignItems: 'center' },
  
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.glassBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder
  },
  logoEmoji: { fontSize: 64 },
  
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: theme.colors.glow,
    textShadowRadius: 20
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 48
  },
  
  inputContainer: {
    width: '100%',
    marginBottom: 24
  },
  input: {
    backgroundColor: theme.colors.glassBg,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    borderRadius: 16,
    padding: 18,
    color: '#fff',
    fontSize: 16,
    backdropFilter: 'blur(10px)'
  },
  
  button: {
    width: '100%',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    ...theme.shadows.glow
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600'
  },
  
  features: {
    flexDirection: 'row',
    marginTop: 48,
    gap: 16
  },
  featureBadge: {
    backgroundColor: theme.colors.glassBg,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    alignItems: 'center',
    gap: 4
  },
  featureIcon: { fontSize: 24 },
  featureText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '500'
  }
});
```

#### C. Modernize Home Screen

Make HomeScreen cards more dynamic with:
- Gradient backgrounds
- Hover effects (use Animated API)
- Recent meetings section
- Quick actions with icons

#### D. Modernize Call Screen Panels

Update AI Panel and Moodboard panel with:
- Glassmorphism effect
- Smooth animations (Animated API or Reanimated)
- Better spacing and typography
- Loading skeletons
- Success/error states with animations

---

### 4. Add Real-time Transcript (Advanced)

**Option 1: Use Deepgram** (if you have API key)
- Capture audio during call
- Send to backend `/api/ai/transcribe`
- Display real-time

**Option 2: Mock Progressive Transcript** (for demo)
- Simulate typing effect
- Show phrases appearing one by one

---

### 5. Add Image Upload & Sharing

Allow users to:
1. Upload their own images to annotate
2. Share annotated images back to the call
3. Save annotated images to device

**Implementation**:
```bash
npx expo install expo-media-library expo-sharing
```

Update AnnotationScreen:
```typescript
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

const handleSave = async () => {
  const image = canvasRef.current?.makeImageSnapshot();
  if (image) {
    const base64 = image.encodeToBase64();
    
    // Save to device
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status === 'granted') {
      const asset = await MediaLibrary.createAssetAsync(`data:image/png;base64,${base64}`);
      await MediaLibrary.createAlbumAsync('FaceTime AI', asset, false);
      alert('Saved to gallery!');
    }
    
    // Share
    await Sharing.shareAsync(`data:image/png;base64,${base64}`);
    
    navigation.goBack();
  }
};
```

---

## 📋 Testing Checklist

After implementing:

- [ ] AnnotationScreen works without errors
- [ ] Can draw on images smoothly
- [ ] AI notes generation works
- [ ] Moodboard images generate
- [ ] Meeting notes persist and can be viewed later
- [ ] Images persist and can be viewed later
- [ ] UI looks modern with gradients and glassmorphism
- [ ] Animations are smooth
- [ ] History screen shows past meetings
- [ ] Can save and share annotated images

---

## 🚀 Quick Start Commands

```bash
# Install persistence
cd /home/mahesh/facetime/mobile-app
npx expo install @react-native-async-storage/async-storage

# Install UI libraries
npx expo install expo-linear-gradient expo-blur

# Install media libraries
npx expo install expo-media-library expo-sharing

# Clear cache and rebuild
npx expo start --clear

# In another terminal, run Android
npx expo run:android
```

---

## 📝 Priority Order

1. **HIGH**: Fix annotation screen (cache clear + test)
2. **HIGH**: Add data persistence (AsyncStorage integration)
3. **MEDIUM**: Modernize UI (gradients, glassmorphism)
4. **MEDIUM**: Add history screen
5. **LOW**: Add image save/share features
6. **LOW**: Add animations and micro-interactions

---

**Note**: The backend is already set up with all AI endpoints. The mobile app just needs to persist the responses and modernize the UI presentation.
