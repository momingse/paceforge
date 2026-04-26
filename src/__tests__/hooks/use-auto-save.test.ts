import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAutoSave } from '@/hooks/use-auto-save';
import { useOnboardingStore } from '@/store/use-onboarding-store';
import * as service from '@/services/indexed-db/onboarding-service';

vi.mock('@/services/indexed-db/onboarding-service', () => ({
  updateProfile: vi.fn().mockResolvedValue(undefined),
}));

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useOnboardingStore.setState({
      currentStep: 1,
      isCompleted: false,
      profileId: null,
      profile: {},
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('does not save when profileId is null', () => {
    renderHook(() => useAutoSave());
    vi.advanceTimersByTime(1000);
    expect(service.updateProfile).not.toHaveBeenCalled();
  });

  it('saves after debounce delay', () => {
    useOnboardingStore.setState({
      profileId: 'test-id',
      profile: { basics: { age: 30, sex: 'male', experienceLevel: 'new' } },
    });

    renderHook(() => useAutoSave());
    expect(service.updateProfile).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    expect(service.updateProfile).toHaveBeenCalledWith(
      'test-id',
      expect.objectContaining({
        basics: { age: 30, sex: 'male', experienceLevel: 'new' },
      })
    );
  });

  it('does not save before debounce completes', () => {
    useOnboardingStore.setState({
      profileId: 'test-id',
      profile: { basics: { age: 30, sex: 'male', experienceLevel: 'new' } },
    });

    renderHook(() => useAutoSave());
    vi.advanceTimersByTime(300);
    expect(service.updateProfile).not.toHaveBeenCalled();
  });

  it('debounces rapid updates', () => {
    useOnboardingStore.setState({
      profileId: 'test-id',
      profile: { basics: { age: 25, sex: 'female', experienceLevel: 'new' } },
    });

    renderHook(() => useAutoSave());

    vi.advanceTimersByTime(300);
    useOnboardingStore.getState().updateBasics({ age: 26 });
    vi.advanceTimersByTime(300);
    useOnboardingStore.getState().updateBasics({ age: 27 });
    vi.advanceTimersByTime(500);

    expect(service.updateProfile).toHaveBeenCalledTimes(1);
  });

  it('uses custom delay when provided', () => {
    useOnboardingStore.setState({
      profileId: 'test-id',
      profile: { basics: { age: 30, sex: 'male', experienceLevel: 'new' } },
    });

    renderHook(() => useAutoSave(1000));
    vi.advanceTimersByTime(500);
    expect(service.updateProfile).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    expect(service.updateProfile).toHaveBeenCalledTimes(1);
  });

  it('returns isSaving state', () => {
    useOnboardingStore.setState({
      profileId: 'test-id',
      profile: { basics: { age: 30, sex: 'male', experienceLevel: 'new' } },
    });

    const { result } = renderHook(() => useAutoSave());
    expect(result.current.isSaving).toBe(false);

    vi.advanceTimersByTime(500);
  });
});
