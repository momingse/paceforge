import { useEffect, useRef, useState, useCallback } from 'react';
import { useOnboardingStore } from '@/store/use-onboarding-store';
import { updateProfile } from '@/services/indexed-db/onboarding-service';

export function useAutoSave(delay = 500) {
  const profileId = useOnboardingStore((state) => state.profileId);
  const profile = useOnboardingStore((state) => state.profile);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const save = useCallback(async () => {
    if (!profileId) return;
    setIsSaving(true);
    try {
      await updateProfile(profileId, profile);
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [profileId, profile]);

  useEffect(() => {
    if (!profileId) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(save, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [profileId, profile, delay, save]);

  return { isSaving };
}
