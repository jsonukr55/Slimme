import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useHealthConnect, HealthData } from '@/hooks/use-health-connect';
import { useHealthCache } from '@/hooks/use-health-cache';
import { useExerciseLog } from '@/hooks/use-exercise-log';
import { useWeightLog } from '@/hooks/use-weight-log';
import { getDateKey } from '@/lib/date-utils';
import { generateId } from '@/lib/id';
import { WorkoutEntry } from '@/types/exercise';

function StatRow({ icon, label, value, unit, color }: {
  icon: string; label: string; value: string | number | null; unit?: string; color: string;
}) {
  return (
    <View style={styles.statRow}>
      <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: value != null ? Colors.text : Colors.textLight }]}>
        {value != null ? `${value}${unit ? ' ' + unit : ''}` : 'No data'}
      </Text>
    </View>
  );
}

export default function HealthSyncScreen() {
  const { status, loading, lastSynced, checkAvailability, requestPermissions, fetchTodayData } = useHealthConnect();
  const { addWorkout } = useExerciseLog(getDateKey());
  const { addWeight } = useWeightLog();
  const { saveHealthData } = useHealthCache();

  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [availStatus, setAvailStatus] = useState<string>('checking');
  const [importedWorkouts, setImportedWorkouts] = useState<Set<string>>(new Set());

  useEffect(() => {
    checkAvailability().then(setAvailStatus);
  }, []);

  const handleSync = async () => {
    if (availStatus !== 'available') {
      Alert.alert('Not Available', `Health Connect status: ${availStatus}`);
      return;
    }
    const granted = await requestPermissions();
    if (!granted) {
      Alert.alert(
        'Permission Required',
        'Please grant Health Connect permissions to sync your Samsung Health data.',
        [
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
          { text: 'Cancel' },
        ]
      );
      return;
    }
    const data = await fetchTodayData();
    if (!data) {
      Alert.alert('Sync Failed', 'Could not read data from Health Connect. Make sure Samsung Health is syncing to Health Connect (Samsung Health → Settings → Connected services → Health Connect).');
      return;
    }
    await saveHealthData(data);
    setHealthData(data);
  };

  const handleImportWeight = async () => {
    if (!healthData?.weightKg) return;
    await addWeight(healthData.weightKg, 'Imported from Samsung Health');
    Alert.alert('Done!', `Weight ${healthData.weightKg} kg added to your log`);
  };

  const handleImportWorkout = async (exercise: HealthData['exercises'][0]) => {
    const key = exercise.startTime;
    if (importedWorkouts.has(key)) return;

    const workout: Omit<WorkoutEntry, 'id' | 'date' | 'timestamp'> = {
      name: exercise.title,
      exercises: [{
        exerciseId: 'hc_' + generateId(),
        exerciseName: exercise.title,
        sets: [{ setNumber: 1, duration: exercise.durationMinutes * 60 }],
      }],
      durationMinutes: exercise.durationMinutes,
      caloriesBurned: Math.round(exercise.calories),
      notes: 'Imported from Samsung Health / Health Connect',
    };

    await addWorkout(workout);
    setImportedWorkouts((prev) => new Set([...prev, key]));
    Alert.alert('Done!', `"${exercise.title}" added to your workout log`);
  };

  const handleImportAllWorkouts = async () => {
    if (!healthData?.exercises.length) return;
    let count = 0;
    for (const ex of healthData.exercises) {
      if (!importedWorkouts.has(ex.startTime)) {
        await handleImportWorkout(ex);
        count++;
      }
    }
    if (count === 0) Alert.alert('Already Imported', 'All workouts have been imported');
  };

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Not available state
  if (availStatus === 'not_supported') {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="warning-outline" size={56} color={Colors.warning} />
        <Text style={styles.unavailableTitle}>Health Connect Not Supported</Text>
        <Text style={styles.unavailableText}>
          Health Connect requires Android 9 or later. Your device may not support it.
        </Text>
      </View>
    );
  }

  if (availStatus === 'not_installed') {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="download-outline" size={56} color={Colors.primary} />
        <Text style={styles.unavailableTitle}>Health Connect Not Installed</Text>
        <Text style={styles.unavailableText}>
          Install Health Connect from the Play Store, then enable Samsung Health sync in Samsung Health → Settings → Connected services → Health Connect.
        </Text>
        <Button
          title="Open Play Store"
          onPress={() => Linking.openURL('https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata')}
          style={{ marginTop: Spacing.lg }}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={[styles.watchIcon, { backgroundColor: Colors.primary + '15' }]}>
            <Ionicons name="watch-outline" size={32} color={Colors.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Samsung Health Sync</Text>
            <Text style={styles.headerSubtitle}>
              {lastSynced
                ? `Last synced: ${lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Pull data from your Samsung Galaxy Watch'}
            </Text>
          </View>
        </View>

        {/* Setup instructions */}
        {!healthData && (
          <View style={styles.setupSteps}>
            <Text style={styles.setupTitle}>Setup (first time only):</Text>
            {[
              'Open Samsung Health → tap your profile icon',
              'Go to Settings → Connected services → Health Connect',
              'Enable "Sync with Health Connect"',
              'Tap Sync below and grant permissions',
            ].map((step, i) => (
              <View key={i} style={styles.setupStep}>
                <View style={styles.stepNum}><Text style={styles.stepNumText}>{i + 1}</Text></View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        )}

        <Button
          title={loading ? 'Syncing...' : 'Sync Now'}
          onPress={handleSync}
          loading={loading}
          style={{ marginTop: Spacing.md }}
          icon={<Ionicons name="sync-outline" size={18} color="#FFF" />}
        />
      </Card>

      {/* Data display */}
      {healthData && (
        <>
          {/* Activity Summary */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Today's Activity</Text>
            <StatRow icon="footsteps-outline" label="Steps" value={healthData.steps.toLocaleString()} color={Colors.primary} />
            <StatRow icon="flame-outline" label="Active Calories" value={healthData.activeCaloriesBurned} unit="kcal" color={Colors.accent} />
            <StatRow icon="flame" label="Total Calories Burned" value={healthData.totalCaloriesBurned} unit="kcal" color={Colors.error} />
            <StatRow icon="navigate-outline" label="Distance" value={healthData.distanceKm} unit="km" color={Colors.protein} />
          </Card>

          {/* Heart Rate */}
          {healthData.heartRateAvg && (
            <Card style={styles.card}>
              <Text style={styles.sectionTitle}>Heart Rate</Text>
              <View style={styles.hrRow}>
                <View style={styles.hrItem}>
                  <Ionicons name="heart" size={24} color={Colors.error} />
                  <Text style={styles.hrValue}>{healthData.heartRateAvg}</Text>
                  <Text style={styles.hrLabel}>Avg BPM</Text>
                </View>
                <View style={styles.hrItem}>
                  <Ionicons name="arrow-down-outline" size={20} color={Colors.success} />
                  <Text style={styles.hrValue}>{healthData.heartRateMin}</Text>
                  <Text style={styles.hrLabel}>Min BPM</Text>
                </View>
                <View style={styles.hrItem}>
                  <Ionicons name="arrow-up-outline" size={20} color={Colors.error} />
                  <Text style={styles.hrValue}>{healthData.heartRateMax}</Text>
                  <Text style={styles.hrLabel}>Max BPM</Text>
                </View>
              </View>
            </Card>
          )}

          {/* Sleep */}
          {healthData.sleepMinutes != null && (
            <Card style={styles.card}>
              <Text style={styles.sectionTitle}>Sleep (Last Night)</Text>
              <StatRow
                icon="moon-outline"
                label="Sleep Duration"
                value={formatDuration(healthData.sleepMinutes)}
                color={Colors.fiber}
              />
            </Card>
          )}

          {/* Weight */}
          {healthData.weightKg && (
            <Card style={styles.card}>
              <View style={styles.importHeader}>
                <Text style={styles.sectionTitle}>Weight</Text>
                <TouchableOpacity style={styles.importBtn} onPress={handleImportWeight}>
                  <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
                  <Text style={styles.importBtnText}>Import to Log</Text>
                </TouchableOpacity>
              </View>
              <StatRow icon="scale-outline" label="Latest Weight" value={healthData.weightKg} unit="kg" color={Colors.protein} />
            </Card>
          )}

          {/* Workouts */}
          {healthData.exercises.length > 0 && (
            <Card style={styles.card}>
              <View style={styles.importHeader}>
                <Text style={styles.sectionTitle}>Workouts ({healthData.exercises.length})</Text>
                <TouchableOpacity style={styles.importBtn} onPress={handleImportAllWorkouts}>
                  <Ionicons name="download-outline" size={18} color={Colors.primary} />
                  <Text style={styles.importBtnText}>Import All</Text>
                </TouchableOpacity>
              </View>

              {healthData.exercises.map((ex, idx) => {
                const imported = importedWorkouts.has(ex.startTime);
                return (
                  <View key={idx} style={styles.workoutRow}>
                    <View style={[styles.workoutIcon, { backgroundColor: Colors.accent + '15' }]}>
                      <Ionicons name="barbell-outline" size={20} color={Colors.accent} />
                    </View>
                    <View style={styles.workoutInfo}>
                      <Text style={styles.workoutName}>{ex.title}</Text>
                      <Text style={styles.workoutMeta}>
                        {formatTime(ex.startTime)} · {formatDuration(ex.durationMinutes)}
                        {ex.calories > 0 ? ` · ${Math.round(ex.calories)} kcal` : ''}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleImportWorkout(ex)}
                      style={[styles.importSingle, imported && styles.importedSingle]}
                      disabled={imported}
                    >
                      <Ionicons
                        name={imported ? 'checkmark-circle' : 'add-circle-outline'}
                        size={24}
                        color={imported ? Colors.success : Colors.primary}
                      />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </Card>
          )}

          {healthData.exercises.length === 0 && (
            <Card style={styles.card}>
              <Text style={styles.noWorkouts}>No workouts recorded today from Samsung Health.</Text>
            </Card>
          )}
        </>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  unavailableTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginTop: Spacing.md, textAlign: 'center' },
  unavailableText: { fontSize: 14, color: Colors.textSecondary, marginTop: Spacing.sm, textAlign: 'center', lineHeight: 22 },
  headerCard: { margin: Spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  watchIcon: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  headerSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  setupSteps: { backgroundColor: Colors.background, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.sm },
  setupTitle: { fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  setupStep: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: 8 },
  stepNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { fontSize: 11, fontWeight: '700', color: '#FFF' },
  stepText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  card: { marginHorizontal: Spacing.md, marginBottom: Spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  statIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  statLabel: { flex: 1, fontSize: 14, color: Colors.text, fontWeight: '500' },
  statValue: { fontSize: 15, fontWeight: '700' },
  hrRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: Spacing.sm },
  hrItem: { alignItems: 'center', gap: 4 },
  hrValue: { fontSize: 24, fontWeight: '700', color: Colors.text },
  hrLabel: { fontSize: 11, color: Colors.textSecondary },
  importHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  importBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primary + '15', paddingHorizontal: 10, paddingVertical: 6, borderRadius: BorderRadius.full },
  importBtnText: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  workoutRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  workoutIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  workoutInfo: { flex: 1 },
  workoutName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  workoutMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  importSingle: { padding: 4 },
  importedSingle: { opacity: 0.7 },
  noWorkouts: { fontSize: 14, color: Colors.textLight, fontStyle: 'italic' },
});
