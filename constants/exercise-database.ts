import { ExerciseDefinition } from '@/types/exercise';

export const EXERCISE_DATABASE: ExerciseDefinition[] = [
  // Strength - Upper Body
  { id: 'e1', name: 'Bench Press', category: 'strength', metValue: 6, muscleGroups: ['chest', 'triceps', 'shoulders'] },
  { id: 'e2', name: 'Overhead Press', category: 'strength', metValue: 6, muscleGroups: ['shoulders', 'triceps'] },
  { id: 'e3', name: 'Bicep Curls', category: 'strength', metValue: 4, muscleGroups: ['biceps'] },
  { id: 'e4', name: 'Tricep Dips', category: 'strength', metValue: 5, muscleGroups: ['triceps', 'chest'] },
  { id: 'e5', name: 'Pull-ups', category: 'strength', metValue: 8, muscleGroups: ['back', 'biceps'] },
  { id: 'e6', name: 'Lat Pulldown', category: 'strength', metValue: 5, muscleGroups: ['back', 'biceps'] },
  { id: 'e7', name: 'Dumbbell Rows', category: 'strength', metValue: 5, muscleGroups: ['back', 'biceps'] },
  { id: 'e8', name: 'Push-ups', category: 'strength', metValue: 8, muscleGroups: ['chest', 'triceps', 'core'] },
  { id: 'e9', name: 'Lateral Raises', category: 'strength', metValue: 4, muscleGroups: ['shoulders'] },
  { id: 'e10', name: 'Face Pulls', category: 'strength', metValue: 4, muscleGroups: ['shoulders', 'back'] },

  // Strength - Lower Body
  { id: 'e11', name: 'Squats', category: 'strength', metValue: 6, muscleGroups: ['quadriceps', 'glutes', 'hamstrings'] },
  { id: 'e12', name: 'Deadlifts', category: 'strength', metValue: 6, muscleGroups: ['back', 'hamstrings', 'glutes'] },
  { id: 'e13', name: 'Leg Press', category: 'strength', metValue: 5, muscleGroups: ['quadriceps', 'glutes'] },
  { id: 'e14', name: 'Lunges', category: 'strength', metValue: 6, muscleGroups: ['quadriceps', 'glutes', 'hamstrings'] },
  { id: 'e15', name: 'Leg Curls', category: 'strength', metValue: 4, muscleGroups: ['hamstrings'] },
  { id: 'e16', name: 'Calf Raises', category: 'strength', metValue: 4, muscleGroups: ['calves'] },
  { id: 'e17', name: 'Hip Thrust', category: 'strength', metValue: 5, muscleGroups: ['glutes', 'hamstrings'] },

  // Strength - Core
  { id: 'e18', name: 'Plank', category: 'strength', metValue: 4, muscleGroups: ['core'] },
  { id: 'e19', name: 'Crunches', category: 'strength', metValue: 3.8, muscleGroups: ['core'] },
  { id: 'e20', name: 'Russian Twists', category: 'strength', metValue: 4, muscleGroups: ['core', 'obliques'] },

  // Cardio
  { id: 'e21', name: 'Running (outdoor)', category: 'cardio', metValue: 9.8, muscleGroups: ['legs', 'cardio'] },
  { id: 'e22', name: 'Treadmill', category: 'cardio', metValue: 8, muscleGroups: ['legs', 'cardio'] },
  { id: 'e23', name: 'Cycling (outdoor)', category: 'cardio', metValue: 7.5, muscleGroups: ['legs', 'cardio'] },
  { id: 'e24', name: 'Stationary Bike', category: 'cardio', metValue: 7, muscleGroups: ['legs', 'cardio'] },
  { id: 'e25', name: 'Jump Rope', category: 'cardio', metValue: 12.3, muscleGroups: ['legs', 'cardio'] },
  { id: 'e26', name: 'Swimming', category: 'cardio', metValue: 8, muscleGroups: ['full body'] },
  { id: 'e27', name: 'Elliptical', category: 'cardio', metValue: 5, muscleGroups: ['legs', 'cardio'] },
  { id: 'e28', name: 'Rowing Machine', category: 'cardio', metValue: 7, muscleGroups: ['back', 'arms', 'legs'] },
  { id: 'e29', name: 'Walking (brisk)', category: 'cardio', metValue: 4.3, muscleGroups: ['legs'] },
  { id: 'e30', name: 'Stair Climber', category: 'cardio', metValue: 9, muscleGroups: ['legs', 'glutes'] },
  { id: 'e31', name: 'HIIT', category: 'cardio', metValue: 12, muscleGroups: ['full body'] },
  { id: 'e32', name: 'Burpees', category: 'cardio', metValue: 10, muscleGroups: ['full body'] },

  // Flexibility
  { id: 'e33', name: 'Yoga', category: 'flexibility', metValue: 3, muscleGroups: ['full body'] },
  { id: 'e34', name: 'Stretching', category: 'flexibility', metValue: 2.5, muscleGroups: ['full body'] },
  { id: 'e35', name: 'Pilates', category: 'flexibility', metValue: 3, muscleGroups: ['core', 'full body'] },

  // Sports
  { id: 'e36', name: 'Basketball', category: 'sports', metValue: 6.5, muscleGroups: ['full body'] },
  { id: 'e37', name: 'Tennis', category: 'sports', metValue: 7.3, muscleGroups: ['full body'] },
  { id: 'e38', name: 'Soccer', category: 'sports', metValue: 7, muscleGroups: ['legs', 'cardio'] },
  { id: 'e39', name: 'Cricket', category: 'sports', metValue: 5, muscleGroups: ['full body'] },
  { id: 'e40', name: 'Badminton', category: 'sports', metValue: 5.5, muscleGroups: ['arms', 'legs'] },
];
