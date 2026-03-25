export type ExerciseCategory = 'strength' | 'cardio' | 'flexibility' | 'sports';

export interface ExerciseDefinition {
  id: string;
  name: string;
  category: ExerciseCategory;
  metValue: number;
  muscleGroups: string[];
}

export interface ExerciseSet {
  setNumber: number;
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
}

export interface WorkoutExercise {
  exerciseId: string;
  exerciseName: string;
  sets: ExerciseSet[];
}

export interface WorkoutEntry {
  id: string;
  date: string;
  name: string;
  exercises: WorkoutExercise[];
  durationMinutes: number;
  caloriesBurned: number;
  timestamp: number;
  notes?: string;
}
