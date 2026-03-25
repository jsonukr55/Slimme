import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, FlatList, Alert, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFoodLog } from '@/hooks/use-food-log';
import { useFoodDatabase } from '@/hooks/use-food-database';
import { useCustomFoods } from '@/hooks/use-custom-foods';
import { FoodSuggestions } from '@/components/food/food-suggestions';
import { MealType, FoodItem } from '@/types/food';
import { generateId } from '@/lib/id';
import { getDateKey } from '@/lib/date-utils';
import { getSuggestedMealType } from '@/constants/food-suggestions';
import { analyzeFoodWithAI } from '@/lib/ai-food-analyzer';

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function AddFoodScreen() {
  const params = useLocalSearchParams();
  const date = (params.date as string) || getDateKey();
  const { addEntry } = useFoodLog(date);

  const [mealType, setMealType] = useState<MealType>(
    (params.mealType as MealType) || getSuggestedMealType()
  );
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState<'search' | 'manual'>('search');
  const [quantity, setQuantity] = useState('1');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [saving, setSaving] = useState(false);

  const { foods: FOOD_DATABASE, searchFoods } = useFoodDatabase();
  const { customFoods, saveFood, searchCustomFoods } = useCustomFoods();

  const [manualName, setManualName] = useState('');
  const [manualCal, setManualCal] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFat, setManualFat] = useState('');
  const [manualFiber, setManualFiber] = useState('');
  const [manualCategory, setManualCategory] = useState<MealType>(mealType);
  const [aiLoading, setAiLoading] = useState(false);
  const [prefillSource, setPrefillSource] = useState<string | null>(null);

  const filteredFoods = search
    ? [...searchCustomFoods(search), ...searchFoods(search)]
    : [...customFoods.slice(0, 5), ...FOOD_DATABASE.slice(0, 15)];

  useEffect(() => {
    if (!manualName.trim() || manualName.length < 3) {
      setPrefillSource(null);
      return;
    }
    const q = manualName.toLowerCase();
    const match =
      customFoods.find((f) => f.name.toLowerCase() === q) ||
      FOOD_DATABASE.find((f) => f.name.toLowerCase() === q) ||
      customFoods.find((f) => f.name.toLowerCase().includes(q)) ||
      FOOD_DATABASE.find((f) => f.name.toLowerCase().includes(q));
    if (match) setPrefillSource(match.name);
    else setPrefillSource(null);
  }, [manualName, customFoods, FOOD_DATABASE]);

  const applyPrefill = () => {
    const q = manualName.toLowerCase();
    const match =
      customFoods.find((f) => f.name.toLowerCase() === q) ||
      FOOD_DATABASE.find((f) => f.name.toLowerCase() === q) ||
      customFoods.find((f) => f.name.toLowerCase().includes(q)) ||
      FOOD_DATABASE.find((f) => f.name.toLowerCase().includes(q));
    if (!match) return;
    setManualCal(String(match.nutrients.calories));
    setManualProtein(String(match.nutrients.protein));
    setManualCarbs(String(match.nutrients.carbs));
    setManualFat(String(match.nutrients.fat));
    setManualFiber(String(match.nutrients.fiber));
    setPrefillSource(null);
  };

  const analyzeWithAI = async () => {
    if (!manualName.trim()) { Alert.alert('Enter food name first'); return; }
    setAiLoading(true);
    try {
      const result = await analyzeFoodWithAI(manualName);
      if (result.foods.length > 0) {
        const food = result.foods[0];
        setManualCal(String(Math.round(food.nutrients.calories)));
        setManualProtein(String(food.nutrients.protein));
        setManualCarbs(String(food.nutrients.carbs));
        setManualFat(String(food.nutrients.fat));
        setManualFiber(String(food.nutrients.fiber || 0));
      }
    } catch (e: any) {
      Alert.alert('AI Analysis Failed', e.message || 'Could not analyze food');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSelectFood = (food: FoodItem) => { setSelectedFood(food); setSearch(''); };

  const handleAddFromDB = async () => {
    if (!selectedFood) return;
    setSaving(true);
    try {
      await addEntry({ mealType, foodItem: selectedFood, quantity: parseFloat(quantity) || 1 });
      router.back();
    } finally { setSaving(false); }
  };

  const handleAddManual = async () => {
    if (!manualName || !manualCal) { Alert.alert('Missing Info', 'Name and calories are required'); return; }
    setSaving(true);
    try {
      const customFood: FoodItem = {
        id: generateId(),
        name: manualName.trim(),
        category: manualCategory,
        servingSize: 100,
        servingUnit: 'g',
        nutrients: {
          calories: parseFloat(manualCal) || 0,
          protein: parseFloat(manualProtein) || 0,
          carbs: parseFloat(manualCarbs) || 0,
          fat: parseFloat(manualFat) || 0,
          fiber: parseFloat(manualFiber) || 0,
        },
      };
      await saveFood(customFood);
      await addEntry({ mealType, foodItem: customFood, quantity: parseFloat(quantity) || 1 });
      router.back();
    } finally { setSaving(false); }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.mealSelector}>
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

      <View style={styles.modeToggle}>
        <TouchableOpacity style={[styles.modeBtn, mode === 'search' && styles.modeBtnActive]} onPress={() => setMode('search')}>
          <Ionicons name="search-outline" size={16} color={mode === 'search' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.modeBtnText, mode === 'search' && styles.modeBtnTextActive]}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.modeBtn, mode === 'manual' && styles.modeBtnActive]} onPress={() => setMode('manual')}>
          <Ionicons name="create-outline" size={16} color={mode === 'manual' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.modeBtnText, mode === 'manual' && styles.modeBtnTextActive]}>Manual Entry</Text>
        </TouchableOpacity>
      </View>

      {mode === 'search' ? (
        <>
          {!selectedFood && !search && (
            <FoodSuggestions mealType={mealType} onSelect={handleSelectFood} customFoods={customFoods} />
          )}
          <Card style={styles.card}>
            <TouchableOpacity style={styles.aiButton} onPress={() => router.push('/food/ai-analyze')}>
              <Ionicons name="sparkles" size={18} color={Colors.fiber} />
              <Text style={styles.aiButtonText}>Use AI to analyze any dish or recipe</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.fiber} />
            </TouchableOpacity>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="Search foods..."
                placeholderTextColor={Colors.textLight}
              />
            </View>
            {!search && !selectedFood && customFoods.length > 0 && (
              <Text style={styles.sectionLabel}>My Foods + Database</Text>
            )}
            {selectedFood ? (
              <View style={styles.selectedFood}>
                <View style={styles.selectedFoodHeader}>
                  <Text style={styles.selectedFoodName}>{selectedFood.name}</Text>
                  <TouchableOpacity onPress={() => setSelectedFood(null)}>
                    <Ionicons name="close-circle" size={22} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.selectedFoodMeta}>
                  Per {selectedFood.servingSize}{selectedFood.servingUnit}: {selectedFood.nutrients.calories} cal | P:{selectedFood.nutrients.protein}g | C:{selectedFood.nutrients.carbs}g | F:{selectedFood.nutrients.fat}g
                </Text>
                <Input label="Servings" value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" />
                <View style={styles.previewBox}>
                  <Text style={styles.previewLabel}>Total:</Text>
                  <Text style={styles.previewValue}>
                    {Math.round(selectedFood.nutrients.calories * parseFloat(quantity || '1'))} cal | {Math.round(selectedFood.nutrients.protein * parseFloat(quantity || '1'))}g protein
                  </Text>
                </View>
                <Button title="Add to Log" onPress={handleAddFromDB} loading={saving} />
              </View>
            ) : (
              <FlatList
                data={filteredFoods}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.foodItem} onPress={() => handleSelectFood(item)}>
                    <View style={styles.foodItemInfo}>
                      <View style={styles.foodNameRow}>
                        <Text style={styles.foodItemName}>{item.name}</Text>
                        {customFoods.some((f) => f.id === item.id) && (
                          <View style={styles.myFoodBadge}><Text style={styles.myFoodBadgeText}>My Food</Text></View>
                        )}
                      </View>
                      <Text style={styles.foodItemMeta}>{item.servingSize}{item.servingUnit} - {item.nutrients.calories} cal</Text>
                    </View>
                    <View style={styles.macroChips}>
                      <Text style={[styles.macroChip, { color: Colors.protein }]}>P:{item.nutrients.protein}g</Text>
                      <Text style={[styles.macroChip, { color: Colors.carbs }]}>C:{item.nutrients.carbs}g</Text>
                      <Text style={[styles.macroChip, { color: Colors.fat }]}>F:{item.nutrients.fat}g</Text>
                    </View>
                  </TouchableOpacity>
                )}
                ListFooterComponent={!search ? <Text style={styles.moreHint}>Search to find all items</Text> : null}
              />
            )}
          </Card>
        </>
      ) : (
        <Card style={styles.card}>
          <Text style={styles.manualTitle}>Enter Nutritional Info</Text>
          <Text style={styles.categoryLabel}>Meal Category</Text>
          <View style={styles.categoryRow}>
            {(['breakfast', 'lunch', 'snack', 'dinner'] as MealType[]).map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, manualCategory === cat && styles.categoryChipActive]}
                onPress={() => setManualCategory(cat)}
              >
                <Text style={[styles.categoryChipText, manualCategory === cat && styles.categoryChipTextActive]}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Input label="Food Name *" value={manualName} onChangeText={setManualName} placeholder="e.g. Homemade dal" />
          {prefillSource ? (
            <TouchableOpacity style={styles.prefillBanner} onPress={applyPrefill}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
              <Text style={styles.prefillText}>Found "{prefillSource}" — tap to pre-fill</Text>
            </TouchableOpacity>
          ) : manualName.length >= 3 ? (
            <TouchableOpacity style={styles.aiAnalyzeBtn} onPress={analyzeWithAI} disabled={aiLoading}>
              {aiLoading ? <ActivityIndicator size="small" color={Colors.fiber} /> : <Ionicons name="sparkles" size={16} color={Colors.fiber} />}
              <Text style={styles.aiAnalyzeBtnText}>{aiLoading ? 'Analyzing...' : 'Analyze with AI'}</Text>
            </TouchableOpacity>
          ) : null}
          <Input label="Calories *" value={manualCal} onChangeText={setManualCal} keyboardType="numeric" suffix="kcal" />
          <Input label="Protein" value={manualProtein} onChangeText={setManualProtein} keyboardType="decimal-pad" suffix="g" />
          <Input label="Carbohydrates" value={manualCarbs} onChangeText={setManualCarbs} keyboardType="decimal-pad" suffix="g" />
          <Input label="Fat" value={manualFat} onChangeText={setManualFat} keyboardType="decimal-pad" suffix="g" />
          <Input label="Fiber" value={manualFiber} onChangeText={setManualFiber} keyboardType="decimal-pad" suffix="g" />
          <Input label="Servings" value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" />
          <Text style={styles.saveNote}>This food will be saved to your personal list</Text>
          <Button title="Add to Log" onPress={handleAddManual} loading={saving} />
        </Card>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  mealSelector: { flexDirection: 'row', backgroundColor: Colors.surface, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.xs },
  mealTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: BorderRadius.sm },
  mealTabActive: { backgroundColor: Colors.primary },
  mealTabText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  mealTabTextActive: { color: '#FFF' },
  modeToggle: { flexDirection: 'row', marginHorizontal: Spacing.md, marginVertical: Spacing.sm, gap: Spacing.sm },
  modeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: BorderRadius.sm, borderWidth: 1.5, borderColor: Colors.border },
  modeBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '10' },
  modeBtnText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  modeBtnTextActive: { color: Colors.primary },
  card: { marginHorizontal: Spacing.md, marginBottom: Spacing.md },
  aiButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.fiber + '15', borderRadius: BorderRadius.sm, padding: Spacing.sm, marginBottom: Spacing.md },
  aiButtonText: { flex: 1, fontSize: 13, fontWeight: '500', color: Colors.fiber },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.md, paddingVertical: 10, gap: 8, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md },
  searchInput: { flex: 1, fontSize: 15, color: Colors.text },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.sm },
  foodItem: { paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  foodItemInfo: {},
  foodNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  foodItemName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  myFoodBadge: { backgroundColor: Colors.primary + '20', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  myFoodBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.primary },
  foodItemMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  macroChips: { flexDirection: 'row', gap: 8, marginTop: 4 },
  macroChip: { fontSize: 11, fontWeight: '600' },
  selectedFood: {},
  selectedFoodHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  selectedFoodName: { fontSize: 16, fontWeight: '700', color: Colors.text },
  selectedFoodMeta: { fontSize: 12, color: Colors.textSecondary, marginBottom: Spacing.md },
  previewBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primary + '10', padding: Spacing.sm, borderRadius: BorderRadius.sm, marginBottom: Spacing.md },
  previewLabel: { fontSize: 14, fontWeight: '600', color: Colors.text },
  previewValue: { fontSize: 13, color: Colors.primary, fontWeight: '500' },
  moreHint: { fontSize: 12, color: Colors.textLight, textAlign: 'center', paddingVertical: 12 },
  manualTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
  prefillBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.success + '15', borderRadius: BorderRadius.sm, padding: Spacing.sm, marginBottom: Spacing.sm },
  prefillText: { flex: 1, fontSize: 13, color: Colors.success, fontWeight: '500' },
  aiAnalyzeBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.fiber + '15', borderRadius: BorderRadius.sm, padding: Spacing.sm, marginBottom: Spacing.sm },
  aiAnalyzeBtnText: { fontSize: 13, fontWeight: '600', color: Colors.fiber },
  saveNote: { fontSize: 12, color: Colors.textSecondary, marginBottom: Spacing.sm },
  categoryLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 },
  categoryRow: { flexDirection: 'row', gap: 6, marginBottom: Spacing.md, flexWrap: 'wrap' },
  categoryChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface },
  categoryChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryChipText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  categoryChipTextActive: { color: '#FFF' },
});
