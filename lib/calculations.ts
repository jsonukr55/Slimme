import { Sex } from '@/types/user';

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export function getBMIColor(bmi: number): string {
  if (bmi < 18.5) return '#3B82F6';
  if (bmi < 25) return '#10B981';
  if (bmi < 30) return '#F59E0B';
  return '#EF4444';
}

export function calculateBMR(weightKg: number, heightCm: number, age: number, sex: Sex): number {
  if (sex === 'male') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  }
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
}

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function calculateTDEE(bmr: number, activityLevel: string): number {
  return Math.round(bmr * (ACTIVITY_MULTIPLIERS[activityLevel] || 1.55));
}

export function calculateCaloriesBurned(metValue: number, weightKg: number, durationMinutes: number): number {
  return Math.round(metValue * weightKg * (durationMinutes / 60));
}

export function kgToLbs(kg: number): number {
  return kg * 2.20462;
}

export function lbsToKg(lbs: number): number {
  return lbs / 2.20462;
}

export function cmToFtIn(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

export function ftInToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * 2.54;
}
