import { useOnboardingStore } from '@/store/use-onboarding-store';

export function useOnboardingNavigation() {
  const currentStep = useOnboardingStore((state) => state.currentStep);
  const setCurrentStep = useOnboardingStore((state) => state.setCurrentStep);

  const isFirstStep = currentStep === 1;
  const isLastDataStep = currentStep === 4;
  const isSummary = currentStep === 5;
  const isComplete = currentStep === 6;

  const goBack = () => {
    if (isSummary) {
      setCurrentStep(4);
    } else if (!isFirstStep && !isComplete) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goForward = () => {
    if (isLastDataStep) {
      setCurrentStep(5);
    } else if (isSummary) {
      setCurrentStep(6);
    } else if (!isSummary && !isComplete) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= 4) {
      setCurrentStep(step);
    }
  };

  return {
    currentStep,
    isFirstStep,
    isLastDataStep,
    isSummary,
    isComplete,
    goBack,
    goForward,
    goToStep,
  };
}
