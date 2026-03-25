import React, { useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { useWeightLog } from '@/hooks/use-weight-log';
import { useGoals } from '@/hooks/use-goals';
import { calculateBMI, getBMICategory, getBMIColor } from '@/lib/calculations';
import { useUserProfile } from '@/hooks/use-user-profile';
import { formatShortDate, parseDate } from '@/lib/date-utils';

const screenWidth = Dimensions.get('window').width;

export default function WeightScreen() {
  const { history, getLatestWeight, getStartingWeight, getWeightChange, refresh } = useWeightLog();
  const { goals } = useGoals();
  const { profile } = useUserProfile();

  useFocusEffect(useCallback(() => { refresh(); }, []));

  const latestWeight = getLatestWeight();
  const startWeight = getStartingWeight();
  const change = getWeightChange();

  const bmi = latestWeight && profile?.heightCm ? calculateBMI(latestWeight, profile.heightCm) : null;

  const chartData = history.slice(-14);

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Stats */}
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Current</Text>
              <Text style={styles.statValue}>{latestWeight ? `${latestWeight} kg` : '--'}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Start</Text>
              <Text style={styles.statValue}>{startWeight ? `${startWeight} kg` : '--'}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Change</Text>
              <Text style={[styles.statValue, { color: change && change < 0 ? Colors.success : change && change > 0 ? Colors.error : Colors.text }]}>
                {change !== null ? `${change > 0 ? '+' : ''}${change.toFixed(1)} kg` : '--'}
              </Text>
            </View>
            {goals.targetWeight && (
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Goal</Text>
                <Text style={styles.statValue}>{goals.targetWeight} kg</Text>
              </View>
            )}
          </View>
        </Card>

        {/* BMI */}
        {bmi && (
          <Card style={styles.bmiCard}>
            <View style={styles.bmiRow}>
              <View>
                <Text style={styles.bmiLabel}>BMI</Text>
                <Text style={[styles.bmiValue, { color: getBMIColor(bmi) }]}>{bmi.toFixed(1)}</Text>
              </View>
              <View style={[styles.bmiCategory, { backgroundColor: getBMIColor(bmi) + '20' }]}>
                <Text style={[styles.bmiCategoryText, { color: getBMIColor(bmi) }]}>{getBMICategory(bmi)}</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/bmi')} style={styles.bmiLink}>
                <Text style={styles.bmiLinkText}>Calculator</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Chart */}
        {chartData.length >= 2 ? (
          <Card style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Weight Trend</Text>
            <LineChart
              data={{
                labels: chartData.map((e, i) => i % 3 === 0 ? formatShortDate(parseDate(e.date)) : ''),
                datasets: [{ data: chartData.map((e) => e.weight) }],
              }}
              width={screenWidth - 64}
              height={200}
              yAxisSuffix=" kg"
              chartConfig={{
                backgroundColor: Colors.surface,
                backgroundGradientFrom: Colors.surface,
                backgroundGradientTo: Colors.surface,
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                propsForDots: { r: '4', strokeWidth: '2', stroke: Colors.primary },
              }}
              bezier
              style={styles.chart}
            />
          </Card>
        ) : (
          <EmptyState
            icon="analytics-outline"
            title="Not enough data"
            subtitle="Log at least 2 weights to see your trend chart"
          />
        )}

        {/* History */}
        <Card style={styles.historyCard}>
          <Text style={styles.sectionTitle}>History</Text>
          {history.length === 0 ? (
            <Text style={styles.noData}>No weight entries yet</Text>
          ) : (
            [...history].reverse().slice(0, 20).map((entry) => (
              <View key={entry.id} style={styles.historyItem}>
                <View>
                  <Text style={styles.historyDate}>{formatShortDate(parseDate(entry.date))}</Text>
                  {entry.note && <Text style={styles.historyNote}>{entry.note}</Text>}
                </View>
                <Text style={styles.historyWeight}>{entry.weight} kg</Text>
              </View>
            ))
          )}
        </Card>

        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/weight/add')}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  statsCard: { marginHorizontal: Spacing.md, marginTop: Spacing.sm, marginBottom: Spacing.md },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statLabel: { fontSize: 12, color: Colors.textSecondary },
  statValue: { fontSize: 18, fontWeight: '700', color: Colors.text, marginTop: 4 },
  bmiCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.md },
  bmiRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  bmiLabel: { fontSize: 12, color: Colors.textSecondary },
  bmiValue: { fontSize: 28, fontWeight: '700' },
  bmiCategory: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: BorderRadius.full },
  bmiCategoryText: { fontSize: 13, fontWeight: '600' },
  bmiLink: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' },
  bmiLinkText: { fontSize: 14, color: Colors.primary, fontWeight: '500' },
  chartCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  chart: { borderRadius: BorderRadius.md },
  historyCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.md },
  noData: { fontSize: 14, color: Colors.textLight, fontStyle: 'italic' },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  historyDate: { fontSize: 14, fontWeight: '500', color: Colors.text },
  historyNote: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  historyWeight: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  fab: {
    position: 'absolute', bottom: 20, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.protein,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 5,
  },
});
