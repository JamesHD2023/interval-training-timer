import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import TimerDisplay from "@/components/TimerDisplay";
import InfoPanel from "@/components/InfoPanel";
import { useTimer } from "@/hooks/useTimer";
import { useAudio } from "@/hooks/useAudio";
import { useWakeLock } from "@/hooks/useWakeLock";

interface Interval {
  name: string;
  duration: number;
  message: string;
}

const intervals: Interval[] = [
  { name: "Warm-up", duration: 300, message: "Begin warm-up walk" },
  { name: "Fast Pace", duration: 180, message: "Fast pace - go!" },
  { name: "Recovery", duration: 90, message: "Recovery pace" },
  { name: "Fast Pace", duration: 180, message: "Fast pace - go!" },
  { name: "Recovery", duration: 90, message: "Recovery pace" },
  { name: "Fast Pace", duration: 180, message: "Fast pace - go!" },
  { name: "Recovery", duration: 90, message: "Recovery pace" },
  { name: "Fast Pace", duration: 180, message: "Fast pace - go!" },
  { name: "Recovery", duration: 90, message: "Recovery pace" },
  { name: "Fast Pace", duration: 180, message: "Fast pace - go!" },
  { name: "Cool-down", duration: 300, message: "Final cool-down" },
];

export default function JapaneseWalking() {
  const navigate = useNavigate();
  const { playBeep, playDoubleBeep, speak } = useAudio();
  const { requestWakeLock, releaseWakeLock } = useWakeLock();
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);

  const currentInterval = intervals[currentIntervalIndex];
  const totalDuration = intervals.reduce((sum, int) => sum + int.duration, 0);
  const elapsedTotal = intervals
    .slice(0, currentIntervalIndex)
    .reduce((sum, int) => sum + int.duration, 0);

  const { timeLeft, isRunning, start, pause, reset } = useTimer(
    currentInterval.duration,
    () => {
      if (currentIntervalIndex < intervals.length - 1) {
        setCurrentIntervalIndex((prev) => prev + 1);
      } else {
        handleComplete();
      }
    }
  );

  useEffect(() => {
    if (isRunning && timeLeft === currentInterval.duration) {
      speak(currentInterval.message);
      if (currentInterval.name === "Fast Pace") {
        playBeep();
      } else if (currentInterval.name === "Recovery") {
        playDoubleBeep();
      }
    }
  }, [currentIntervalIndex, isRunning, timeLeft]);

  useEffect(() => {
    if (isRunning) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
    return () => releaseWakeLock();
  }, [isRunning]);

  const handleComplete = async () => {
    releaseWakeLock();
    speak("Workout complete!");
    try {
      await fetch("/api/timer/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timerType: "Japanese Walking", duration: totalDuration }),
      });
    } catch (err) {
      console.error("Failed to save session:", err);
    }
  };

  const handleReset = () => {
    reset();
    setCurrentIntervalIndex(0);
    releaseWakeLock();
  };

  const progress = ((elapsedTotal + (currentInterval.duration - timeLeft)) / totalDuration) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Japanese Walking</h1>
          <div className="w-10" />
        </div>

        <InfoPanel
          title="About Japanese Walking"
          description="High-intensity interval walking shown to improve cardiovascular fitness and metabolic health"
          howToPerform={[
            "Maintain proper upright posture",
            "Fast intervals should be challenging but sustainable (7-8 out of 10 effort)",
            "Recovery pace should allow breathing to normalize",
            "Can be done on treadmill or outdoors",
          ]}
          benefits={["Improved VO2 max", "Fat burning", "Time-efficient"]}
          frequency="2-3 times per week"
        />

        <TimerDisplay
          timeLeft={timeLeft}
          intervalName={currentInterval.name}
          intervalNumber={currentIntervalIndex + 1}
          totalIntervals={intervals.length}
          progress={progress}
          isRunning={isRunning}
          onStart={start}
          onPause={pause}
          onReset={handleReset}
        />
      </div>
    </div>
  );
}
