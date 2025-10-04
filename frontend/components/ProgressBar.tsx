interface ProgressBarProps {
  progress: number;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-orange-500 transition-all duration-300 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
