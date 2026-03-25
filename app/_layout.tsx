import { useEffect, useState } from 'react';
import { Stack, useRouter, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator } from 'react-native';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Colors } from '@/constants/colors';
import { auth } from '@/lib/firebase';

export default function RootLayout() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const router = useRouter();
  const navState = useRootNavigationState();

  // Listen to Firebase auth state
  useEffect(() => {
    const timeout = setTimeout(() => setUser(null), 5000);
    const unsub = onAuthStateChanged(auth, (u) => {
      clearTimeout(timeout);
      setUser(u);
    });
    return () => { unsub(); clearTimeout(timeout); };
  }, []);

  // Navigate once both nav is ready and auth state is known
  useEffect(() => {
    if (!navState?.key || user === undefined) return;
    if (user) {
      router.replace('/(tabs)');
    } else {
      router.replace('/auth/login');
    }
  }, [navState?.key, user]);

  if (user === undefined) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false }} />
        <Stack.Screen name="food/add" options={{ title: 'Add Food', presentation: 'modal' }} />
        <Stack.Screen name="food/ai-analyze" options={{ title: 'AI Food Analyzer', presentation: 'modal' }} />
        <Stack.Screen name="exercise/add" options={{ title: 'Add Workout', presentation: 'modal' }} />
        <Stack.Screen name="weight/add" options={{ title: 'Log Weight', presentation: 'modal' }} />
        <Stack.Screen name="goals/edit" options={{ title: 'Edit Goals', presentation: 'modal' }} />
        <Stack.Screen name="achievements" options={{ title: 'Achievements' }} />
        <Stack.Screen name="bmi" options={{ title: 'BMI Calculator' }} />
        <Stack.Screen name="nutrients" options={{ title: 'Nutrient Details' }} />
        <Stack.Screen name="health-sync" options={{ title: 'Samsung Health Sync' }} />
        <Stack.Screen name="hunter/add-quest" options={{ title: 'New Quest', presentation: 'modal', headerStyle: { backgroundColor: '#0D0D1A' }, headerTintColor: '#7C3AED', headerTitleStyle: { color: '#E5E7EB', fontWeight: '700' } }} />
        <Stack.Screen name="hunter/trophies" options={{ title: 'Trophy Vault', headerStyle: { backgroundColor: '#0D0D1A' }, headerTintColor: '#7C3AED', headerTitleStyle: { color: '#E5E7EB', fontWeight: '700' } }} />
      </Stack>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
