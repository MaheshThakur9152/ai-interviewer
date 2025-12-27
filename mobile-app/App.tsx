import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import CallScreen from './src/screens/CallScreen';
import AnnotationScreen from './src/screens/AnnotationScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import { theme } from './src/theme/theme';
import { StatusBar } from 'expo-status-bar';

const Stack = createNativeStackNavigator();

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background }
      }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
            <Stack.Screen name="Call" component={CallScreen} options={{
              gestureEnabled: false,
            }} />
            <Stack.Screen name="Annotation" component={AnnotationScreen} options={{
              presentation: 'fullScreenModal',
            }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
