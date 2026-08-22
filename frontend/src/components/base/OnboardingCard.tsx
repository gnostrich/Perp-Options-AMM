"use client"
import { CardComponentProps } from 'nextstepjs';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

const OnboardingCard: React.FC<CardComponentProps> = ({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  skipTour,
}) => {
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentStep === totalSteps - 1) {
      confetti({
        particleCount: 250,
        spread: 160,
        origin: { y: 0.6 },
        zIndex: 9999,
      });
    }
  }, [currentStep, totalSteps]);

  useEffect(() => {
    if (currentStep === 0 && cardRef.current) {
      // Scroll to card when first step appears
      cardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    }
  }, [currentStep]);

  return (
    <div ref={cardRef} className="relative">
      <Card className="w-[350px] bg-[#3C3C3C] text-white border border-black rounded-none">
        <CardHeader>
          <CardTitle className="text-lg font-bold">{step.title}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 font-medium">
          <span className="text-white">{step.content}</span>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          {/* Progress bar */}
          <div className="w-full h-3 bg-[#E5E7EB] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#448D7A] transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {step.showControls && (
            <div className="flex justify-between items-center w-full">
              <Button
                onClick={prevStep}
                disabled={currentStep === 0}
                variant="noShadow"
                className={cn(
                  "bg-[#F3F4F6] text-black hover:bg-gray-300",
                  currentStep === 0 && "opacity-50"
                )}
              >
                Previous
              </Button>
              <p className="text-sm text-white">{`${currentStep + 1} of ${totalSteps}`}</p>
              <Button
                variant="noShadow"
                className="bg-[#3e8c7d] text-white hover:bg-[#36786d]"
                onClick={nextStep}
              >
                {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          )}

          {/* Only show Skip Tour button, if not the last step */}
          {step.showSkip && currentStep !== totalSteps - 1 && (
            <Button
              onClick={skipTour}
              variant="noShadow"
              className="w-full bg-[#F3F4F6] text-black font-medium shadow-md hover:bg-gray-300"
            >
              Skip Tour
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default OnboardingCard;
