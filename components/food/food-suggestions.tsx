import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FoodItem, MealType } from '@/types/food';
import { FOOD_DATABASE } from '@/constants/food-database';
import { MEAL_SUGGESTIONS, getSuggestedMealType } from '@/constants/food-suggestions';
import { Colors } from '@/constants/colors';

const MEAL_ICONS: Record<MealType, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  snack: '🍎',
  dinner: '🌙',
};

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast ideas',
  lunch: 'Lunch ideas',
  snack: 'Snack ideas',
  dinner: 'Dinner ideas',
};

const TILE_COLORS = [
  '#FF6B6B', '#FF9F43', '#FFC312', '#A3CB38',
  '#1289A7', '#C84B31', '#6F1E51', '#0652DD',
  '#EA2027', '#009432', '#006266', '#833471',
];

interface Props {
  mealType: MealType;
  onSelect: (food: FoodItem) => void;
  customFoods?: FoodItem[];
}

export function FoodSuggestions({ mealType, onSelect, customFoods = [] }: Props) {
  const suggestedMeal = getSuggestedMealType();
  const isTimeMatch = mealType === suggestedMeal;

  const suggestions = useMemo(() => {
    // Custom foods with matching category come first
    const custom = customFoods.filter((f) => f.category === mealType);
    // Then hardcoded suggestions from DB
    const ids = MEAL_SUGGESTIONS[mealType] ?? [];
    const dbFoods = ids
      .map((id) => FOOD_DATABASE.find((f) => f.id === id))
      .filter(Boolean) as FoodItem[];
    // Deduplicate by name
    const customNames = new Set(custom.map((f) => f.name.toLowerCase()));
    const deduped = dbFoods.filter((f) => !customNames.has(f.name.toLowerCase()));
    return [...custom, ...deduped];
  }, [mealType, customFoods]);

  if (suggestions.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerIcon}>{MEAL_ICONS[mealType]}</Text>
        <Text style={styles.header}>{MEAL_LABELS[mealType]}</Text>
        {isTimeMatch && (
          <View style={styles.nowBadge}>
            <Ionicons name="time-outline" size={11} color="#FFF" />
            <Text style={styles.nowText}>Now</Text>
          </View>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {suggestions.map((food, idx) => (
          <SuggestionTile
            key={food.id}
            food={food}
            color={TILE_COLORS[idx % TILE_COLORS.length]}
            onSelect={onSelect}
            isCustom={customFoods.some((f) => f.id === food.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function SuggestionTile({
  food, color, onSelect, isCustom,
}: {
  food: FoodItem;
  color: string;
  onSelect: (f: FoodItem) => void;
  isCustom: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.tile, { borderTopColor: color, borderTopWidth: 3 }]}
      onPress={() => onSelect(food)}
      activeOpacity={0.8}
    >
      <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
        <Ionicons name="restaurant" size={20} color={color} />
      </View>
      {isCustom && (
        <View style={styles.myBadge}><Text style={styles.myBadgeText}>Mine</Text></View>
      )}
      <Text style={styles.name} numberOfLines={2}>{food.name}</Text>
      <Text style={[styles.cal, { color }]}>{food.nutrients.calories} kcal</Text>
      <View style={styles.macroRow}>
        <Text style={[styles.macro, { color: Colors.protein }]}>P {food.nutrients.protein}g</Text>
        <Text style={[styles.macro, { color: Colors.carbs }]}>C {food.nutrients.carbs}g</Text>
        <Text style={[styles.macro, { color: Colors.fat }]}>F {food.nutrients.fat}g</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  headerIcon: { fontSize: 16 },
  header: { fontSize: 15, fontWeight: '700', color: Colors.text, flex: 1 },
  nowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  nowText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  scrollContent: { paddingLeft: 16, paddingRight: 8, gap: 10 },
  tile: {
    width: 120,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 2,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  myBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.primary,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  myBadgeText: { fontSize: 9, fontWeight: '700', color: '#FFF' },
  name: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 16,
    minHeight: 32,
    marginBottom: 4,
  },
  cal: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  macroRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  macro: { fontSize: 10, fontWeight: '600' },
});
