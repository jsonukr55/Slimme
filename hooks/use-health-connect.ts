import { useState, useCallback } from 'react';
import {
  initialize,
  requestPermission,
  getGrantedPermissions,
  readRecords,
  getSdkStatus,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';
import { TimeRangeFilter } from 'react-native-health-connect/src/types/base.types';

export interface HealthData {
  steps: number;
  activeCaloriesBurned: number;
  totalCaloriesBurned: number;
  heartRateAvg: number | null;
  heartRateMin: number | null;
  heartRateMax: number | null;
  weightKg: number | null;
  sleepMinutes: number | null;
  distanceKm: number;
  exercises: HealthExercise[];
}

export interface HealthExercise {
  title: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  calories: number;
  exerciseType: number;
}

const PERMISSIONS = [
  { accessType: 'read', recordType: 'Steps' },
  { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
  { accessType: 'read', recordType: 'TotalCaloriesBurned' },
  { accessType: 'read', recordType: 'HeartRate' },
  { accessType: 'read', recordType: 'Weight' },
  { accessType: 'read', recordType: 'ExerciseSession' },
  { accessType: 'read', recordType: 'SleepSession' },
  { accessType: 'read', recordType: 'Distance' },
] as const;

export type HealthConnectStatus = 'unknown' | 'available' | 'not_installed' | 'not_supported' | 'no_permission' | 'error';

export function useHealthConnect() {
  const [status, setStatus] = useState<HealthConnectStatus>('unknown');
  const [loading, setLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  const checkAvailability = useCallback(async (): Promise<HealthConnectStatus> => {
    try {
      const sdkStatus = await getSdkStatus();
      if (sdkStatus === SdkAvailabilityStatus.SDK_AVAILABLE) {
        return 'available';
      } else if (sdkStatus === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) {
        return 'not_installed';
      } else {
        return 'not_supported';
      }
    } catch {
      return 'not_supported';
    }
  }, []);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const isInit = await initialize();
      if (!isInit) return false;
      const granted = await requestPermission(PERMISSIONS as any);
      if (granted.length > 0) return true;
      // Permissions may already be granted — check existing grants
      const existing = await getGrantedPermissions();
      return existing.length > 0;
    } catch {
      return false;
    }
  }, []);

  const fetchTodayData = useCallback(async (): Promise<HealthData | null> => {
    setLoading(true);
    try {
      const isInit = await initialize();
      if (!isInit) {
        setStatus('not_installed');
        return null;
      }

      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);

      const timeFilter: TimeRangeFilter = {
        operator: 'between',
        startTime: startOfDay.toISOString(),
        endTime: now.toISOString(),
      };

      const safeRead = async (type: string, filter: TimeRangeFilter) => {
        try {
          const result = await readRecords(type as any, { timeRangeFilter: filter });
          if (result.records.length > 0) {
            console.log(`[HealthConnect] ${type} records:`, JSON.stringify(result.records[0]));
          } else {
            console.log(`[HealthConnect] ${type}: 0 records`);
          }
          return result;
        } catch (e) {
          console.log(`[HealthConnect] ${type} error:`, e);
          return { records: [] };
        }
      };

      // Steps
      const stepsResult = await safeRead('Steps', timeFilter);
      const steps = stepsResult.records.reduce((sum: number, r: any) => sum + (r.count || 0), 0);

      // Active calories
      const activeCalResult = await safeRead('ActiveCaloriesBurned', timeFilter);
      const activeCalories = activeCalResult.records.reduce(
        (sum: number, r: any) => sum + (r.energy?.inKilocalories || 0), 0
      );

      // Total calories
      const totalCalResult = await safeRead('TotalCaloriesBurned', timeFilter);
      const totalCalories = totalCalResult.records.reduce(
        (sum: number, r: any) => sum + (r.energy?.inKilocalories || 0), 0
      );

      // Heart rate
      const hrResult = await safeRead('HeartRate', timeFilter);
      const hrSamples = hrResult.records.flatMap((r: any) => r.samples?.map((s: any) => s.beatsPerMinute) || []);
      const heartRateAvg = hrSamples.length > 0
        ? Math.round(hrSamples.reduce((a: number, b: number) => a + b, 0) / hrSamples.length)
        : null;
      const heartRateMin = hrSamples.length > 0 ? Math.min(...hrSamples) : null;
      const heartRateMax = hrSamples.length > 0 ? Math.max(...hrSamples) : null;

      // Weight (last 7 days)
      const weightFilter: TimeRangeFilter = {
        operator: 'between',
        startTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: now.toISOString(),
      };
      const weightResult = await safeRead('Weight', weightFilter);
      const latestWeight = weightResult.records.length > 0
        ? (weightResult.records[weightResult.records.length - 1] as any).weight?.inKilograms || null
        : null;

      // Distance
      const distResult = await safeRead('Distance', timeFilter);
      const distanceKm = distResult.records.reduce(
        (sum: number, r: any) => sum + (r.distance?.inKilometers || 0), 0
      );

      // Exercise sessions
      const exResult = await safeRead('ExerciseSession', timeFilter);
      const exercises: HealthExercise[] = exResult.records.map((r: any) => {
        const start = new Date(r.startTime);
        const end = new Date(r.endTime);
        const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
        return {
          title: r.title || getExerciseTypeName(r.exerciseType),
          startTime: r.startTime,
          endTime: r.endTime,
          durationMinutes,
          calories: r.energy?.inKilocalories || 0,
          exerciseType: r.exerciseType || 0,
        };
      });

      // Sleep (last 24h, not just today)
      const sleepFilter: TimeRangeFilter = {
        operator: 'between',
        startTime: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        endTime: now.toISOString(),
      };
      const sleepResult = await safeRead('SleepSession', sleepFilter);
      const sleepMinutes = sleepResult.records.length > 0
        ? sleepResult.records.reduce((sum: number, r: any) => {
            const start = new Date(r.startTime);
            const end = new Date(r.endTime);
            return sum + Math.round((end.getTime() - start.getTime()) / 60000);
          }, 0)
        : null;

      setStatus('available');
      setLastSynced(new Date());

      return {
        steps,
        activeCaloriesBurned: Math.round(activeCalories),
        totalCaloriesBurned: Math.round(totalCalories),
        heartRateAvg,
        heartRateMin,
        heartRateMax,
        weightKg: latestWeight ? Math.round(latestWeight * 10) / 10 : null,
        sleepMinutes,
        distanceKm: Math.round(distanceKm * 100) / 100,
        exercises,
      };
    } catch (err: any) {
      if (err?.message?.includes('permission')) {
        setStatus('no_permission');
      } else {
        setStatus('error');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    status,
    loading,
    lastSynced,
    checkAvailability,
    requestPermissions,
    fetchTodayData,
  };
}

function getExerciseTypeName(type: number): string {
  const types: Record<number, string> = {
    0: 'Other',
    2: 'Badminton',
    4: 'Baseball',
    5: 'Basketball',
    8: 'Biking',
    9: 'Biking (Stationary)',
    10: 'Boot Camp',
    11: 'Boxing',
    13: 'Cricket',
    14: 'Dancing',
    16: 'Elliptical',
    17: 'Exercise Class',
    18: 'Fencing',
    19: 'Football (American)',
    20: 'Football (Australian)',
    21: 'Football (Soccer)',
    22: 'Frisbee',
    23: 'Golf',
    24: 'Gymnastics',
    25: 'Handball',
    26: 'High Intensity Interval Training',
    27: 'Hiking',
    28: 'Ice Hockey',
    29: 'Ice Skating',
    31: 'Martial Arts',
    32: 'Paddling',
    33: 'Paragliding',
    35: 'Pilates',
    36: 'Racquetball',
    37: 'Rock Climbing',
    38: 'Roller Hockey',
    39: 'Rowing',
    40: 'Rowing Machine',
    41: 'Rugby',
    42: 'Running',
    43: 'Running (Treadmill)',
    44: 'Sailing',
    45: 'Scuba Diving',
    46: 'Skating',
    47: 'Skiing',
    48: 'Snowboarding',
    49: 'Snowshoeing',
    50: 'Soccer',
    51: 'Softball',
    52: 'Squash',
    53: 'Stair Climbing',
    54: 'Stair Climbing Machine',
    55: 'Strength Training',
    56: 'Stretching',
    57: 'Surfing',
    58: 'Swimming (Open Water)',
    59: 'Swimming (Pool)',
    60: 'Table Tennis',
    61: 'Tennis',
    62: 'Volleyball',
    63: 'Walking',
    64: 'Water Polo',
    65: 'Weightlifting',
    66: 'Wheelchair',
    67: 'Yoga',
  };
  return types[type] || 'Workout';
}
