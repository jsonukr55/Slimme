export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface NutrientInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar?: number;
  sodium?: number;
}

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  servingSize: number;
  servingUnit: string;
  nutrients: NutrientInfo;
  imageQuery?: string;
  category?: MealType;
}

export interface FoodLogEntry {
  id: string;
  date: string;
  mealType: MealType;
  foodItem: FoodItem;
  quantity: number;
  timestamp: number;
}
