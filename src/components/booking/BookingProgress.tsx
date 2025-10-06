import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingProgressProps {
  currentStep: number;
  totalSteps: number;
}

const stepLabels = [
  'Select Service',
  'Choose Date & Time',
  'Your Information',
  'Review Booking',
  'Confirmation'
];

export function BookingProgress({ currentStep, totalSteps }: BookingProgressProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={stepNumber} className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                  isCompleted && "bg-accent text-accent-foreground shadow-glow",
                  isCurrent && "bg-gradient-gold text-luxury-black shadow-elegant scale-110",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground border border-border"
                )}
              >
                {isCompleted ? (
                  <Check size={16} className="animate-scale-in" />
                ) : (
                  stepNumber
                )}
              </div>
              <span 
                className={cn(
                  "text-xs mt-2 text-center max-w-[80px] transition-colors duration-300",
                  isCurrent && "text-foreground font-medium",
                  isCompleted && "text-accent",
                  !isCompleted && !isCurrent && "text-muted-foreground"
                )}
              >
                {stepLabels[index]}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-2 mb-6">
        <div
          className="bg-gradient-gold h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}