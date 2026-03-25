import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { calculateBMI, getBMICategory, getBMIColor } from '@/lib/calculations';
import { useWeightLog } from '@/hooks/use-weight-log';
import { useUserProfile } from '@/hooks/use-user-profile';

const BMI_RANGES = [
  { label: 'Underweight', range: '< 18.5', color: '#3B82F6', min: 10, max: 18.5 },
  { label: 'Normal', range: '18.5 - 24.9', color: '#10B981', min: 18.5, max: 25 },
  { label: 'Overweight', range: '25 - 29.9', color: '#F59E0B', min: 25, max: 30 },
  { label: 'Obese', range: '≥ 30', color: '#EF4444', min: 30, max: 50 },
];

export default function BMIScreen() {
  const { getLatestWeight } = useWeightLog();
  const { profile } = useUserProfile();

  const [weight, setWeight] = useState(getLatestWeight()?.toString() || '');
  const [height, setHeight] = useState(profile?.heightCm?.toString() || '');
  const [bmi, setBmi] = useState<number | null>(null);

  const handleCalculate = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!w || !h || w < 20 || h < 100) return;
    setBmi(calculateBMI(w, h));
  };

  const bmiCategory = bmi ? getBMICategory(bmi) : null;
  const bmiColor = bmi ? getBMIColor(bmi) : Colors.textSecondary;

  const getIndicatorPosition = (bmi: number): number => {
    const minBMI = 10;
    const maxBMI = 45;
    const clamped = Math.max(minBMI, Math.min(maxBMI, bmi));
    return ((clamped - minBMI) / (maxBMI - minBMI)) * 100;
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Input
          label="Weight"
          value={weight}
          onChangeText={setWeight}
          keyboardType="decimal-pad"
          placeholder="e.g. 75"
          suffix="kg"
        />
        <Input
          label="Height"
          value={height}
          onChangeText={setHeight}
          keyboardType="decimal-pad"
          placeholder="e.g. 175"
          suffix="cm"
        />
        <Button title="Calculate BMI" onPress={handleCalculate} size="lg" />
      </Card>

      {bmi && (
        <>
          {/* BMI Result */}
          <Card style={styles.resultCard}>
            <Text style={styles.resultLabel}>Your BMI</Text>
            <Text style={[styles.bmiValue, { color: bmiColor }]}>{bmi.toFixed(1)}</Text>
            <View style={[styles.categoryBadge, { backgroundColor: bmiColor + '20' }]}>
              <Text style={[styles.categoryText, { color: bmiColor }]}>{bmiCategory}</Text>
            </View>
          </Card>

          {/* BMI Scale */}
          <Card style={styles.scaleCard}>
            <Text style={styles.scaleTitle}>BMI Scale</Text>
            <View style={styles.scaleBar}>
              {BMI_RANGES.map((range, i) => (
                <View key={i} style={[styles.scaleSegment, { backgroundColor: range.color, flex: range.max - range.min }]} />
              ))}
            </View>
            <View style={styles.indicatorRow}>
              <View style={[styles.indicator, { left: `${getIndicatorPosition(bmi)}%` as any }]}>
                <View style={[styles.indicatorDot, { borderColor: bmiColor }]} />
                <Text style={[styles.indicatorLabel, { color: bmiColor }]}>{bmi.toFixed(1)}</Text>
              </View>
            </View>

            <View style={styles.rangesGrid}>
              {BMI_RANGES.map((range) => (
                <View key={range.label} style={styles.rangeItem}>
                  <View style={[styles.rangeDot, { backgroundColor: range.color }]} />
                  <View>
                    <Text style={styles.rangeLabel}>{range.label}</Text>
                    <Text style={styles.rangeValue}>{range.range}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>

          {/* Info */}
          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>What does this mean?</Text>
            <Text style={styles.infoText}>
              {bmiCategory === 'Underweight' && 'A BMI below 18.5 suggests you may be underweight. Consider consulting a healthcare provider about healthy weight gain strategies.'}
              {bmiCategory === 'Normal' && 'A BMI between 18.5–24.9 is considered a healthy weight range. Maintaining this through balanced diet and regular exercise is ideal.'}
              {bmiCategory === 'Overweight' && 'A BMI of 25–29.9 indicates overweight. Small lifestyle changes like increased activity and mindful eating can help.'}
              {bmiCategory === 'Obese' && 'A BMI above 30 indicates obesity. This is associated with increased health risks. Consult a healthcare provider for personalized guidance.'}
            </Text>
            <Text style={styles.infoDisclaimer}>
              Note: BMI is a screening tool, not a diagnostic measure. It doesn't account for muscle mass, age, or other factors.
            </Text>
          </Card>
        </>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  card: { margin: Spacing.md },
  resultCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.md, alignItems: 'center', paddingVertical: Spacing.lg },
  resultLabel: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  bmiValue: { fontSize: 56, fontWeight: '700', marginVertical: 8 },
  categoryBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: BorderRadius.full },
  categoryText: { fontSize: 16, fontWeight: '700' },
  scaleCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.md },
  scaleTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
  scaleBar: { flexDirection: 'row', height: 16, borderRadius: BorderRadius.full, overflow: 'hidden', marginBottom: 24 },
  scaleSegment: {},
  indicatorRow: { position: 'relative', height: 30, marginBottom: Spacing.sm },
  indicator: { position: 'absolute', alignItems: 'center', transform: [{ translateX: -12 }] },
  indicatorDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.surface, borderWidth: 3 },
  indicatorLabel: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  rangesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: Spacing.sm },
  rangeItem: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '45%' },
  rangeDot: { width: 10, height: 10, borderRadius: 5 },
  rangeLabel: { fontSize: 13, fontWeight: '600', color: Colors.text },
  rangeValue: { fontSize: 11, color: Colors.textSecondary },
  infoCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.md },
  infoTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  infoText: { fontSize: 14, color: Colors.text, lineHeight: 22, marginBottom: Spacing.sm },
  infoDisclaimer: { fontSize: 12, color: Colors.textSecondary, fontStyle: 'italic' },
});
