import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ProgressBar from "./ProgressBar";

interface TimerDisplayProps {
  timeLeft: number;
  intervalName: string;
  intervalNumber: number;
  totalIntervals: number;
  progress: number;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export default function TimerDisplay({
  timeLeft,
  intervalName,
  intervalNumber,
  totalIntervals,
  progress,
  isRunning,
  onStart,
  onPause,
  onReset,
}: TimerDisplayProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="p-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="text-lg font-medium text-muted-foreground">
          Interval {intervalNumber} of {totalIntervals}
        </div>
        <div className="text-3xl font-bold text-foreground">{intervalName}</div>
      </div>

      <div className="text-center">
        <div className="text-8xl font-bold text-foreground tabular-nums">{formatTime(timeLeft)}</div>
      </div>

      <ProgressBar progress={progress} />

      <div className="flex gap-4">
        {!isRunning ? (
          <Button onClick={onStart} className="flex-1 h-16 text-xl" size="lg">
            <Play className="w-6 h-6 mr-2" />
            Start
          </Button>
        ) : (
          <Button onClick={onPause} variant="secondary" className="flex-1 h-16 text-xl" size="lg">
            <Pause className="w-6 h-6 mr-2" />
            Pause
          </Button>
        )}
        <Button onClick={onReset} variant="outline" className="h-16 w-16" size="lg">
          <RotateCcw className="w-6 h-6" />
        </Button>
      </div>
    </Card>
  );
}
