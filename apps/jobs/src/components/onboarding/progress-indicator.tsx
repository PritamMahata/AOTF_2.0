interface ProgressIndicatorProps {
  stepNumber: number;
  totalSteps: number;
  stepLabel: string;
  progressPct: number;
}

export function ProgressIndicator({ stepNumber, totalSteps, stepLabel, progressPct }: ProgressIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">
          Step {stepNumber} of {totalSteps}
        </span>
        <span className="text-sm text-muted-foreground">{stepLabel}</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
} 