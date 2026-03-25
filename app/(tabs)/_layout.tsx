import { Tabs, router } from 'expo-router';
import { TouchableOpacity, Image, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { useUserProfile } from '@/hooks/use-user-profile';
import { auth } from '@/lib/firebase';

function ProfileButton({ tint = Colors.text }: { tint?: string }) {
  const { profile } = useUserProfile();
  const googlePhoto = auth.currentUser?.photoURL;
  const photo = profile?.photoURL || googlePhoto;

  return (
    <TouchableOpacity
      onPress={() => router.push('/(tabs)/profile')}
      style={{ marginRight: 14, width: 32, height: 32, borderRadius: 16, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}
    >
      {photo ? (
        <Image source={{ uri: photo }} style={{ width: 32, height: 32, borderRadius: 16 }} />
      ) : (
        <Ionicons name="person-circle-outline" size={30} color={tint} />
      )}
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          height: 60 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 4,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: '700', fontSize: 20 },
        headerRight: () => <ProfileButton />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="food"
        options={{
          title: 'Food',
          tabBarIcon: ({ color, size }) => <Ionicons name="restaurant-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="exercise"
        options={{
          title: 'Exercise',
          tabBarIcon: ({ color, size }) => <Ionicons name="barbell-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="hunter"
        options={{
          title: 'Hunter',
          tabBarActiveTintColor: '#7C3AED',
          tabBarIcon: ({ color, size }) => <Ionicons name="skull-outline" size={size} color={color} />,
          headerStyle: { backgroundColor: '#0D0D1A' },
          headerTintColor: '#7C3AED',
          headerTitle: '⚔️ Hunter Mode',
          headerRight: () => <ProfileButton tint="#7C3AED" />,
        }}
      />
      {/* Fully excluded from tab bar */}
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="weight" options={{ href: null }} />
    </Tabs>
  );
}
