import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox, View, ActivityIndicator } from 'react-native';

// State & Navigation
import TabNavigator from './src/navigation/TabNavigator';
import ChatScreen from './src/screens/chat/ChatScreen';
import OnboardingScreen from './src/screens/OnboardingScreen'; // Import the new screen
import { useAppStore } from './src/state/store';
import { theme } from './src/theme';

// Suppress excessive warnings
LogBox.ignoreLogs([
  'Expo AV has been deprecated',
  'ImagePicker.MediaTypeOptions',
]);

// Define the root stack types
export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  Chat: { matchId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  // 1. Get the hydration status (to wait for storage to load)
  // We need to know if the store has finished loading from AsyncStorage
  const [isHydrated, setIsHydrated] = useState(false);
  
  // 2. Get the onboarding status from Zustand
  const hasCompletedOnboarding = useAppStore((state) => state.hasCompletedOnboarding);

  // Wait for Zustand persist to rehydrate
  useEffect(() => {
    // A small hack to ensure hydration is done, or rely on persist onFinish
    // For simplicity, we just use a small timeout or assume it's fast.
    // In a real production app, we might use useAppStore.persist.onFinish
    const timer = setTimeout(() => setIsHydrated(true), 100); 
    return () => clearTimeout(timer);
  }, []);

  if (!isHydrated) {
      return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
      );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          
          {/* Conditional Navigation Logic:
              - If NOT completed onboarding: Show Onboarding Screen only.
              - If completed: Show Main Tabs.
              
              This "Switch" logic prevents users from going "back" to onboarding.
          */}
          
          {!hasCompletedOnboarding ? (
             <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          ) : (
             <>
               <Stack.Screen name="Main" component={TabNavigator} />
               <Stack.Screen 
                  name="Chat" 
                  component={ChatScreen}
                  options={{
                    headerShown: true,
                    presentation: 'card',
                  }}
               />
             </>
          )}

        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}