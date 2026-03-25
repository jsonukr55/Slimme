import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFoodLog } from '@/hooks/use-food-log';
import { analyzeFoodWithAI } from '@/lib/ai-food-analyzer';
import { FoodItem, MealType } from '@/types/food';
import { generateId } from '@/lib/id';
import { getDateKey } from '@/lib/date-utils';

const EXAMPLES = [
  'Chicken biryani, 1 plate',
  'Masala dosa with sambar and chutney',
  '2 boiled eggs and 2 slices whole wheat toast',
  'Protein shake with banana and peanut butter',
  'Dal makhani with 2 rotis',
  'Grilled salmon with roasted broccoli',
  'Big Mac with medium fries',
  'Oatmeal with berries and honey',
];

export default function AIAnalyzeScreen() {
  const { addEntry } = useFoodLog(getDateKey());
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [mealType, setMealType] = useState<MealType>('lunch');

  const handleAnalyze = async () => {
    if (!query.trim()) {
      Alert.alert('Enter food', 'Please describe what you ate');
      return;
    }

    setLoading(true);
    try {
      const analysis = await analyzeFoodWithAI(query);
      setResult(analysis);
    } catch (err: any) {
      Alert.alert('Analysis Failed', err.message || 'Could not analyze this food.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAll = async () => {
    if (!result) return;
    for (const food of result.foods) {
      const foodItem: FoodItem = {
        id: generateId(),
        name: food.name,
        servingSize: food.servingSize,
        servingUnit: food.servingUnit,
        nutrients: food.nutrients,
      };
      await addEntry({ mealType, foodItem, quantity: 1 });
    }
    Alert.alert('Added!', `${result.foods.length} item(s) added to your ${mealType} log`, [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const handleAddSingle = async (food: any) => {
    const foodItem: FoodItem = {
      id: generateId(),
      name: food.name,
      servingSize: food.servingSize,
      servingUnit: food.servingUnit,
      nutrients: food.nutrients,
    };
    await addEntry({ mealType, foodItem, quantity: 1 });
    Alert.alert('Added!', `${food.name} added to your ${mealType} log`);
  };

  const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <Ionicons name="sparkles" size={24} color={Colors.fiber} />
          <View style={styles.headerText}>
            <Text style={styles.title}>AI Food Analyzer</Text>
            <Text style={styles.subtitle}>Powered by Claude AI — analyze any dish, recipe, or meal</Text>
          </View>
        </View>

        {/* Meal Type */}
        <Text style={styles.fieldLabel}>Add to Meal</Text>
        <View style={styles.mealRow}>
          {MEAL_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.mealTab, mealType === type && styles.mealTabActive]}
              onPress={() => setMealType(type)}
            >
              <Text style={[styles.mealTabText, mealType === type && styles.mealTabTextActive]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Query Input */}
        <Text style={styles.fieldLabel}>What did you eat?</Text>
        <View style={styles.queryBox}>
          <TextInput
            style={styles.queryInput}
            value={query}
            onChangeText={setQuery}
            placeholder="e.g. 'Chicken biryani with raita' or '2 eggs and toast with butter'"
            placeholderTextColor={Colors.textLight}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Examples */}
        <Text style={styles.examplesLabel}>Try an example:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.examplesRow}>
          {EXAMPLES.map((ex) => (
            <TouchableOpacity key={ex} style={styles.exampleChip} onPress={() => setQuery(ex)}>
              <Text style={styles.exampleChipText}>{ex}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Button
          title={loading ? 'Analyzing...' : 'Analyze with AI'}
          onPress={handleAnalyze}
          disabled={loading}
          loading={loading}
          style={{ marginTop: Spacing.md }}
        />
      </Card>

      {/* Results */}
      {result && (
        <Card style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>Analysis Result</Text>
            <View style={[styles.confidenceBadge, { backgroundColor: result.foods[0]?.confidence === 'high' ? Colors.success + '20' : Colors.warning + '20' }]}>
              <Text style={[styles.confidenceText, { color: result.foods[0]?.confidence === 'high' ? Colors.success : Colors.warning }]}>
                {result.foods[0]?.confidence || 'medium'} confidence
              </Text>
            </View>
          </View>

          <Text style={styles.resultSummary}>{result.summary}</Text>

          {/* Total */}
          <View style={styles.totalRow}>
            <View style={styles.totalItem}>
              <Text style={[styles.totalValue, { color: Colors.calories }]}>{Math.round(result.totalNutrients.calories)}</Text>
              <Text style={styles.totalLabel}>Calories</Text>
            </View>
            <View style={styles.totalItem}>
              <Text style={[styles.totalValue, { color: Colors.protein }]}>{Math.round(result.totalNutrients.protein)}g</Text>
              <Text style={styles.totalLabel}>Protein</Text>
            </View>
            <View style={styles.totalItem}>
              <Text style={[styles.totalValue, { color: Colors.carbs }]}>{Math.round(result.totalNutrients.carbs)}g</Text>
              <Text style={styles.totalLabel}>Carbs</Text>
            </View>
            <View style={styles.totalItem}>
              <Text style={[styles.totalValue, { color: Colors.fat }]}>{Math.round(result.totalNutrients.fat)}g</Text>
              <Text style={styles.totalLabel}>Fat</Text>
            </View>
          </View>

          {/* Individual Foods */}
          {result.foods.map((food: any, idx: number) => (
            <View key={idx} style={styles.foodResult}>
              <View style={styles.foodResultInfo}>
                <Text style={styles.foodResultName}>{food.name}</Text>
                <Text style={styles.foodResultMeta}>
                  {food.servingSize}{food.servingUnit} — {Math.round(food.nutrients.calories)} cal
                  | P:{Math.round(food.nutrients.protein)}g | C:{Math.round(food.nutrients.carbs)}g | F:{Math.round(food.nutrients.fat)}g
                </Text>
                {food.notes && <Text style={styles.foodResultNote}>{food.notes}</Text>}
              </View>
              <TouchableOpacity onPress={() => handleAddSingle(food)} style={styles.addSingleBtn}>
                <Ionicons name="add-circle" size={28} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          ))}

          <Button title={`Add All to ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`} onPress={handleAddAll} style={{ marginTop: Spacing.md }} />
        </Card>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  card: { margin: Spacing.md },
  headerRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start', marginBottom: Spacing.md },
  headerText: { flex: 1 },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: Spacing.xs },
  mealRow: { flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.md },
  mealTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: BorderRadius.sm, borderWidth: 1.5, borderColor: Colors.border },
  mealTabActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '10' },
  mealTabText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  mealTabTextActive: { color: Colors.primary },
  queryBox: { backgroundColor: Colors.background, borderRadius: BorderRadius.sm, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm },
  queryInput: { fontSize: 15, color: Colors.text, minHeight: 70, textAlignVertical: 'top' },
  examplesLabel: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary, marginBottom: 6 },
  examplesRow: { marginBottom: Spacing.xs },
  exampleChip: { backgroundColor: Colors.fiber + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full, marginRight: 8 },
  exampleChipText: { fontSize: 12, color: Colors.fiber, fontWeight: '500' },
  resultCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.md },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  resultTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  confidenceBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  confidenceText: { fontSize: 11, fontWeight: '600' },
  resultSummary: { fontSize: 13, color: Colors.textSecondary, marginBottom: Spacing.md, fontStyle: 'italic' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: Colors.background, borderRadius: BorderRadius.sm, padding: Spacing.md, marginBottom: Spacing.md },
  totalItem: { alignItems: 'center' },
  totalValue: { fontSize: 18, fontWeight: '700' },
  totalLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  foodResult: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  foodResultInfo: { flex: 1 },
  foodResultName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  foodResultMeta: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  foodResultNote: { fontSize: 11, color: Colors.warning, marginTop: 2, fontStyle: 'italic' },
  addSingleBtn: { padding: 4 },
});
