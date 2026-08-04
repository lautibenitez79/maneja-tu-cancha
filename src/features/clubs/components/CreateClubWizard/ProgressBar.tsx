interface ProgressBarProps {
  step: number;
  total: number;
}

export default function ProgressBar({
  step,
  total,
}: ProgressBarProps) {
  const percentage = (step / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span>
          Paso {step} de {total}
        </span>

        <span>{Math.round(percentage)}%</span>
      </div>

      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-[var(--color-primary)] transition-all duration-300"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}