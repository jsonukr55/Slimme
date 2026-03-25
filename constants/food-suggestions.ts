import { MealType } from '@/types/food';

// Food IDs from food-database.ts grouped by meal time
export const MEAL_SUGGESTIONS: Record<MealType, string[]> = {
  breakfast: [
    'ib8',  // Poha
    'ib1',  // Idli
    'ib2',  // Plain Dosa
    'ib3',  // Masala Dosa
    'ib9',  // Upma
    'ib11', // Besan Chilla
    'ib12', // Moong Dal Chilla
    'ib13', // Aloo Paratha
    'ib10', // Dhokla
    'ib17', // Thepla
    'ib20', // Oats Upma
    'f2',   // Boiled Eggs
    'f10',  // Oatmeal
    'id9',  // Masala Chai
    'ibr1', // Roti
    'id3',  // Lassi
  ],
  lunch: [
    'ir1',  // Basmati Rice
    'dl1',  // Toor Dal
    'dl7',  // Dal Tadka
    'dl6',  // Dal Makhani
    'iv5',  // Palak Paneer
    'iv8',  // Kadai Paneer
    'in1',  // Chicken Curry
    'in2',  // Butter Chicken
    'ir4',  // Chicken Biryani
    'ir3',  // Veg Biryani
    'dl9',  // Chole
    'dl8',  // Rajma
    'ibr1', // Roti
    'ibr3', // Naan
    'id8',  // Raita
    'dl12', // Sambar
    'ir8',  // Curd Rice
  ],
  snack: [
    'is1',  // Samosa
    'is6',  // Bhel Puri
    'is7',  // Pani Puri
    'is8',  // Aloo Chaat
    'ib10', // Dhokla
    'is3',  // Pakora
    'id3',  // Sweet Lassi
    'id4',  // Chaas
    'id9',  // Masala Chai
    'if2',  // Papaya
    'if1',  // Guava
    'if7',  // Banana
    'f50',  // Almonds
    'f51',  // Peanuts
    'f70',  // Protein Bar
  ],
  dinner: [
    'ibr1', // Roti
    'ibr2', // Paratha
    'dl1',  // Toor Dal
    'dl3',  // Masoor Dal
    'iv1',  // Aloo Gobi
    'iv3',  // Baingan Bharta
    'iv4',  // Bhindi Masala
    'iv13', // Methi Sabzi
    'iv11', // Lauki Sabzi
    'ir7',  // Khichdi
    'in1',  // Chicken Curry
    'in7',  // Egg Curry
    'ir8',  // Curd Rice
    'id8',  // Raita
    'iv15', // Mixed Veg
  ],
};

/** Returns appropriate meal type based on current hour */
export function getSuggestedMealType(): MealType {
  const hour = new Date().getHours();
  if (hour >= 6  && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 16) return 'lunch';
  if (hour >= 16 && hour < 19) return 'snack';
  return 'dinner';
}

/** Builds an Unsplash image URL for a given query (no API key required) */
export function getFoodImageUrl(imageQuery: string, size = 120): string {
  const encoded = encodeURIComponent(imageQuery + ',food');
  return `https://source.unsplash.com/${size}x${size}/?${encoded}`;
}
