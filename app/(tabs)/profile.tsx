import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useGoals } from '@/hooks/use-goals';
import { useAchievements } from '@/hooks/use-achievements';
import { calculateBMR, calculateTDEE } from '@/lib/calculations';
import { UserProfile, Sex } from '@/types/user';
import { auth } from '@/lib/firebase';

export default function ProfileScreen() {
  const { profile, saveProfile, loading: profileLoading } = useUserProfile();
  const { goals } = useGoals();
  const { unlocked } = useAchievements();

  const firebaseUser = auth.currentUser;
  const googlePhoto = firebaseUser?.photoURL ?? null;
  const googleName = firebaseUser?.displayName ?? '';

  const [editing, setEditing] = useState(!profile);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [sex, setSex] = useState<Sex>('male');
  const [activityLevel, setActivityLevel] = useState<UserProfile['activityLevel']>('moderate');
  const [photoURL, setPhotoURL] = useState<string | null>(null);

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setName(profile.name || googleName);
      setAge(profile.age?.toString() || '');
      setHeightCm(profile.heightCm?.toString() || '');
      setSex(profile.sex || 'male');
      setActivityLevel(profile.activityLevel || 'moderate');
      setPhotoURL(profile.photoURL || googlePhoto);
    } else if (googleName) {
      setName(googleName);
      setPhotoURL(googlePhoto);
    }
  }, [profile, googleName, googlePhoto]);

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo library access to set a profile picture');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoURL(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name || !age || !heightCm) {
      Alert.alert('Missing Info', 'Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      const newProfile: UserProfile = {
        name,
        age: parseInt(age),
        sex,
        heightCm: parseFloat(heightCm),
        weightUnit: 'kg',
        heightUnit: 'cm',
        activityLevel,
        photoURL: photoURL || undefined,
      };
      await saveProfile(newProfile);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const tdee = profile
    ? calculateTDEE(calculateBMR(70, profile.heightCm, profile.age, profile.sex), profile.activityLevel)
    : null;

  const activityLabels: Record<string, string> = {
    sedentary: 'Sedentary',
    light: 'Lightly Active',
    moderate: 'Moderately Active',
    active: 'Active',
    very_active: 'Very Active',
  };

  const displayPhoto = profile?.photoURL || googlePhoto;

  if (profileLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (editing) {
    return (
      <ScrollView style={styles.container}>
        <Card style={styles.editCard}>
          <Text style={styles.editTitle}>{profile ? 'Edit Profile' : 'Set Up Your Profile'}</Text>

          {/* Photo picker */}
          <View style={styles.photoPickerRow}>
            <TouchableOpacity style={styles.photoPicker} onPress={handlePickPhoto}>
              {photoURL ? (
                <Image source={{ uri: photoURL }} style={styles.photoLarge} />
              ) : (
                <View style={styles.photoPlaceholderLarge}>
                  <Ionicons name="camera-outline" size={32} color={Colors.primary} />
                </View>
              )}
              <View style={styles.photoEditBadge}>
                <Ionicons name="camera" size={14} color="#FFF" />
              </View>
            </TouchableOpacity>
            <View style={styles.photoHint}>
              <Text style={styles.photoHintTitle}>Profile Photo</Text>
              <Text style={styles.photoHintSub}>
                {googlePhoto ? 'Using Google photo — tap to change' : 'Tap to upload from gallery'}
              </Text>
              {photoURL && (
                <TouchableOpacity onPress={() => setPhotoURL(googlePhoto)}>
                  <Text style={styles.resetPhoto}>
                    {googlePhoto ? 'Reset to Google photo' : 'Remove photo'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <Input label="Name *" value={name} onChangeText={setName} placeholder="Your name" />
          <Input label="Age *" value={age} onChangeText={setAge} keyboardType="numeric" placeholder="e.g. 25" />
          <Input label="Height *" value={heightCm} onChangeText={setHeightCm} keyboardType="decimal-pad" placeholder="e.g. 175" suffix="cm" />

          <Text style={styles.fieldLabel}>Sex</Text>
          <View style={styles.toggleRow}>
            {(['male', 'female'] as Sex[]).map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.toggleBtn, sex === s && styles.toggleActive]}
                onPress={() => setSex(s)}
              >
                <Text style={[styles.toggleText, sex === s && styles.toggleTextActive]}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Activity Level</Text>
          {Object.entries(activityLabels).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              style={[styles.activityOption, activityLevel === key && styles.activityActive]}
              onPress={() => setActivityLevel(key as UserProfile['activityLevel'])}
            >
              <Text style={[styles.activityText, activityLevel === key && styles.activityTextActive]}>{label}</Text>
              {activityLevel === key && <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />}
            </TouchableOpacity>
          ))}

          <Button title="Save Profile" onPress={handleSave} loading={saving} style={{ marginTop: Spacing.md }} />
          {profile && (
            <Button title="Cancel" onPress={() => setEditing(false)} variant="outline" style={{ marginTop: Spacing.sm }} />
          )}
        </Card>
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <View style={styles.avatarRow}>
          <TouchableOpacity onPress={() => setEditing(true)}>
            {displayPhoto ? (
              <Image source={{ uri: displayPhoto }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={40} color={Colors.primary} />
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.profileName}>{profile?.name || 'Your Name'}</Text>
            <Text style={styles.profileMeta}>
              {profile?.age} years • {profile?.heightCm} cm • {profile?.sex}
            </Text>
            <Text style={styles.profileActivity}>{activityLabels[profile?.activityLevel || 'moderate']}</Text>
          </View>
          <TouchableOpacity onPress={() => setEditing(true)}>
            <Ionicons name="create-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        {tdee && (
          <View style={styles.tdeeRow}>
            <Ionicons name="flame-outline" size={16} color={Colors.accent} />
            <Text style={styles.tdeeText}>Estimated daily energy: {tdee} kcal (TDEE)</Text>
          </View>
        )}
      </Card>

      <Card style={styles.menuCard}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/weight')}>
          <Ionicons name="scale-outline" size={22} color={Colors.primary} />
          <View style={styles.menuItemInfo}>
            <Text style={styles.menuItemTitle}>Weight Tracker</Text>
            <Text style={styles.menuItemSub}>Log weight &amp; track your progress</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/goals/edit')}>
          <Ionicons name="flag-outline" size={22} color={Colors.primary} />
          <View style={styles.menuItemInfo}>
            <Text style={styles.menuItemTitle}>Fitness Goals</Text>
            <Text style={styles.menuItemSub}>{goals.dailyCalories} cal • {goals.dailyProtein}g protein</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/achievements')}>
          <Ionicons name="trophy-outline" size={22} color={Colors.accent} />
          <View style={styles.menuItemInfo}>
            <Text style={styles.menuItemTitle}>Achievements</Text>
            <Text style={styles.menuItemSub}>{unlocked.length} unlocked</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/bmi')}>
          <Ionicons name="calculator-outline" size={22} color={Colors.protein} />
          <View style={styles.menuItemInfo}>
            <Text style={styles.menuItemTitle}>BMI Calculator</Text>
            <Text style={styles.menuItemSub}>Check your Body Mass Index</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/nutrients')}>
          <Ionicons name="nutrition-outline" size={22} color={Colors.fiber} />
          <View style={styles.menuItemInfo}>
            <Text style={styles.menuItemTitle}>Nutrient Details</Text>
            <Text style={styles.menuItemSub}>Today's detailed breakdown</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => router.push('/health-sync')}>
          <Ionicons name="watch-outline" size={22} color={Colors.success} />
          <View style={styles.menuItemInfo}>
            <Text style={styles.menuItemTitle}>Samsung Health Sync</Text>
            <Text style={styles.menuItemSub}>Import watch data via Health Connect</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
        </TouchableOpacity>
      </Card>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  editCard: { margin: Spacing.md },
  editTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: Spacing.lg },
  photoPickerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
  photoPicker: { position: 'relative' },
  photoLarge: { width: 80, height: 80, borderRadius: 40 },
  photoPlaceholderLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary + '15', alignItems: 'center', justifyContent: 'center' },
  photoEditBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: Colors.primary, borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' },
  photoHint: { flex: 1 },
  photoHintTitle: { fontSize: 15, fontWeight: '600', color: Colors.text },
  photoHintSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  resetPhoto: { fontSize: 12, color: Colors.primary, marginTop: 6, fontWeight: '500' },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: Spacing.xs },
  toggleRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: BorderRadius.sm, borderWidth: 2, borderColor: Colors.border, alignItems: 'center' },
  toggleActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '10' },
  toggleText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  toggleTextActive: { color: Colors.primary },
  activityOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: Spacing.sm, borderRadius: BorderRadius.sm, marginBottom: Spacing.xs, borderWidth: 1, borderColor: Colors.border },
  activityActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '10' },
  activityText: { fontSize: 15, color: Colors.textSecondary },
  activityTextActive: { color: Colors.primary, fontWeight: '600' },
  headerCard: { margin: Spacing.md },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  avatarPlaceholder: { backgroundColor: Colors.primary + '15', alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: '700', color: Colors.text },
  profileMeta: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  profileActivity: { fontSize: 13, color: Colors.primary, marginTop: 2, fontWeight: '500' },
  tdeeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border },
  tdeeText: { fontSize: 13, color: Colors.textSecondary },
  menuCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.md },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuItemInfo: { flex: 1 },
  menuItemTitle: { fontSize: 15, fontWeight: '600', color: Colors.text },
  menuItemSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
});
