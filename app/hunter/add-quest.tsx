import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuests } from '@/hooks/use-quests';
import { QuestCategory, QuestDifficulty } from '@/types/hunter';

const CATEGORIES: { value: QuestCategory; label: string; icon: string }[] = [
  { value: 'health', label: 'Health', icon: 'heart-outline' },
  { value: 'exercise', label: 'Exercise', icon: 'fitness-outline' },
  { value: 'workout', label: 'Workout', icon: 'barbell-outline' },
  { value: 'nutrition', label: 'Nutrition', icon: 'restaurant-outline' },
  { value: 'custom', label: 'Custom', icon: 'star-outline' },
];

const DIFFICULTIES: { value: QuestDifficulty; label: string; color: string }[] = [
  { value: 'easy', label: 'Easy', color: '#10B981' },
  { value: 'normal', label: 'Normal', color: '#3B82F6' },
  { value: 'hard', label: 'Hard', color: '#F59E0B' },
  { value: 'elite', label: 'Elite', color: '#EF4444' },
  { value: 'legendary', label: 'Legendary', color: '#7C3AED' },
];

export default function AddQuestScreen() {
  const { addCustomQuest } = useQuests();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<QuestCategory>('custom');
  const [difficulty, setDifficulty] = useState<QuestDifficulty>('normal');
  const [targetValue, setTargetValue] = useState('1');
  const [unit, setUnit] = useState('times');

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Quest title is required.');
      return;
    }
    const target = parseInt(targetValue, 10);
    if (isNaN(target) || target < 1) {
      Alert.alert('Error', 'Target must be a positive number.');
      return;
    }

    const diffMap: Record<QuestDifficulty, number> = {
      easy: 50,
      normal: 100,
      hard: 180,
      elite: 280,
      legendary: 450,
    };

    await addCustomQuest({
      title: title.trim(),
      description: description.trim() || `Complete: ${title.trim()}`,
      category,
      difficulty,
      period: 'daily',
      xpReward: diffMap[difficulty],
      statReward: {},
      targetValue: target,
      unit: unit.trim() || 'times',
      icon: CATEGORIES.find((c) => c.value === category)?.icon || 'star-outline',
      isCustom: true,
    });

    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.systemText}>[ SYSTEM: NEW QUEST REGISTRATION ]</Text>

      {/* Title */}
      <Text style={styles.label}>Quest Title</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Drink 8 glasses of water"
        placeholderTextColor="#4B5563"
        value={title}
        onChangeText={setTitle}
      />

      {/* Description */}
      <Text style={styles.label}>Description (optional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe your quest..."
        placeholderTextColor="#4B5563"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />

      {/* Category */}
      <Text style={styles.label}>Category</Text>
      <View style={styles.chips}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c.value}
            style={[styles.chip, category === c.value && styles.chipActive]}
            onPress={() => setCategory(c.value)}
          >
            <Ionicons name={c.icon as any} size={14} color={category === c.value ? '#FFF' : '#9CA3AF'} />
            <Text style={[styles.chipText, category === c.value && styles.chipTextActive]}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Difficulty */}
      <Text style={styles.label}>Difficulty</Text>
      <View style={styles.chips}>
        {DIFFICULTIES.map((d) => (
          <TouchableOpacity
            key={d.value}
            style={[
              styles.chip,
              difficulty === d.value && { backgroundColor: d.color, borderColor: d.color },
            ]}
            onPress={() => setDifficulty(d.value)}
          >
            <Text style={[styles.chipText, difficulty === d.value && styles.chipTextActive]}>{d.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Target */}
      <View style={styles.row}>
        <View style={styles.flex1}>
          <Text style={styles.label}>Target</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 8"
            placeholderTextColor="#4B5563"
            value={targetValue}
            onChangeText={setTargetValue}
            keyboardType="numeric"
          />
        </View>
        <View style={[styles.flex1, { marginLeft: 10 }]}>
          <Text style={styles.label}>Unit</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. glasses"
            placeholderTextColor="#4B5563"
            value={unit}
            onChangeText={setUnit}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Ionicons name="add-circle-outline" size={18} color="#FFF" />
        <Text style={styles.saveBtnText}>Create Quest</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  systemText: {
    color: '#7C3AED',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 20,
  },
  label: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#2D2D4E',
    borderRadius: 8,
    padding: 12,
    color: '#E5E7EB',
    fontSize: 14,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2D2D4E',
    backgroundColor: '#1A1A2E',
  },
  chipActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  chipText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFF',
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    padding: 16,
    marginTop: 28,
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
