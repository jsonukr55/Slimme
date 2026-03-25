export type WeightUnit = 'kg' | 'lbs';
export type HeightUnit = 'cm' | 'ft';
export type Sex = 'male' | 'female';

export interface UserProfile {
  name: string;
  age: number;
  sex: Sex;
  heightCm: number;
  weightUnit: WeightUnit;
  heightUnit: HeightUnit;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  photoURL?: string;
}
