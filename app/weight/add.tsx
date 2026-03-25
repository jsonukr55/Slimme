import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useWeightLog } from '@/hooks/use-weight-log';

export default function AddWeightScreen() {
  const { addWeight, getLatestWeight } = useWeightLog();
  const [weight, setWeight] = useState(getLatestWeight()?.toString() || '');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const w = parseFloat(weight);
    if (!w || w < 20 || w > 500) {
      Alert.alert('Invalid Weight', 'Enter a weight between 20 and 500 kg');
      return;
    }
    setSaving(true);
    try {
      await addWeight(w, note || undefined);
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Log Today's Weight</Text>
        <Input
          label="Weight"
          value={weight}
          onChangeText={setWeight}
          keyboardType="decimal-pad"
          placeholder="e.g. 75.5"
          suffix="kg"
        />
        <Input
          label="Note (optional)"
          value={note}
          onChangeText={setNote}
          placeholder="e.g. Morning, fasted"
          multiline
        />
        <Button title="Save Weight" onPress={handleSave} size="lg" loading={saving} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  card: { margin: Spacing.md },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: Spacing.lg },
});
