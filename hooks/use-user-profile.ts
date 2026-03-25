import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '@/types/user';
import { getData, setData } from '@/lib/storage';
import { trackProfileSetup } from '@/lib/achievement-tracker';

const STORAGE_KEY = 'user_profile';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getData<UserProfile>(STORAGE_KEY);
    setProfile(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveProfile = async (newProfile: UserProfile) => {
    await setData(STORAGE_KEY, newProfile);
    setProfile(newProfile);
    trackProfileSetup().catch(() => {});
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...updates };
    await setData(STORAGE_KEY, updated);
    setProfile(updated);
  };

  return { profile, loading, saveProfile, updateProfile };
}
