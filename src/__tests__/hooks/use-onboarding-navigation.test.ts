import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnboardingNavigation } from '@/hooks/use-onboarding-navigation';
import { useOnboardingStore } from '@/store/use-onboarding-store';

describe('useOnboardingNavigation', () => {
  beforeEach(() => {
    useOnboardingStore.setState({
      currentStep: 1,
      isCompleted: false,
      profileId: null,
      profile: {},
    });
  });

  it('starts at step 1 as first step', () => {
    const { result } = renderHook(() => useOnboardingNavigation());
    expect(result.current.currentStep).toBe(1);
    expect(result.current.isFirstStep).toBe(true);
    expect(result.current.isLastDataStep).toBe(false);
    expect(result.current.isSummary).toBe(false);
    expect(result.current.isComplete).toBe(false);
  });

  it('navigates forward from step 1 to step 2', () => {
    const { result } = renderHook(() => useOnboardingNavigation());
    act(() => result.current.goForward());
    expect(result.current.currentStep).toBe(2);
    expect(result.current.isFirstStep).toBe(false);
  });

  it('navigates forward through all data steps', () => {
    const { result } = renderHook(() => useOnboardingNavigation());
    act(() => result.current.goForward());
    expect(result.current.currentStep).toBe(2);
    act(() => result.current.goForward());
    expect(result.current.currentStep).toBe(3);
    act(() => result.current.goForward());
    expect(result.current.currentStep).toBe(4);
    expect(result.current.isLastDataStep).toBe(true);
  });

  it('navigates from step 4 to summary', () => {
    const { result } = renderHook(() => useOnboardingNavigation());
    act(() => result.current.goForward());
    act(() => result.current.goForward());
    act(() => result.current.goForward());
    act(() => result.current.goForward());
    expect(result.current.isSummary).toBe(true);
    expect(result.current.currentStep).toBe(5);
  });

  it('navigates from summary to complete', () => {
    useOnboardingStore.setState({ currentStep: 5 });
    const { result } = renderHook(() => useOnboardingNavigation());
    act(() => result.current.goForward());
    expect(result.current.isComplete).toBe(true);
    expect(result.current.currentStep).toBe(6);
  });

  it('does not go back from step 1', () => {
    const { result } = renderHook(() => useOnboardingNavigation());
    act(() => result.current.goBack());
    expect(result.current.currentStep).toBe(1);
  });

  it('navigates back from step 2 to step 1', () => {
    useOnboardingStore.setState({ currentStep: 2 });
    const { result } = renderHook(() => useOnboardingNavigation());
    act(() => result.current.goBack());
    expect(result.current.currentStep).toBe(1);
  });

  it('navigates back from summary to step 4', () => {
    useOnboardingStore.setState({ currentStep: 5 });
    const { result } = renderHook(() => useOnboardingNavigation());
    act(() => result.current.goBack());
    expect(result.current.currentStep).toBe(4);
  });

  it('goToStep navigates to a specific data step', () => {
    const { result } = renderHook(() => useOnboardingNavigation());
    act(() => result.current.goToStep(3));
    expect(result.current.currentStep).toBe(3);
  });

  it('goToStep ignores out of range steps', () => {
    const { result } = renderHook(() => useOnboardingNavigation());
    act(() => result.current.goToStep(10));
    expect(result.current.currentStep).toBe(1);
    act(() => result.current.goToStep(0));
    expect(result.current.currentStep).toBe(1);
  });
});
