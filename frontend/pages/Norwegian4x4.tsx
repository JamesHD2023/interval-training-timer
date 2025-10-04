import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import TimerDisplay from "@/components/TimerDisplay";
import InfoPanel from "@/components/InfoPanel";
import { useTimer } from "@/hooks/useTimer";
import { useAudio } from "@/hooks/useAudio";
import { useWakeLock } from "@/hooks/useWakeLock";
import { useNotifications } from "@/hooks/useNotifications";
import backend from "~backend/client";

interface Interval {
  name: string;
  duration: number;
  message: string;
}

const intervals: Interval[] = [
  { name: "Warm-up", duration: 600, message: "Warm-up - moderate pace" },
  { name: "High Intensity", duration: 240, message: "High intensity - push hard!" },
  { name: "Active Recovery", duration: 180, message: "Active recovery" },
  { name: "High Intensity", duration: 240, message: "High intensity - push hard!" },
  { name: "Active Recovery", duration: 180, message: "Active recovery" },
  { name: "High Intensity", duration: 240, message: "High intensity - push hard!" },
  { name: "Active Recovery", duration: 180, message: "Active recovery" },
  { name: "High Intensity", duration: 240, message: "High intensity - push hard!" },
  { name: "Cool-down", duration: 300, message: "Cool-down begins" },
];

export default function Norwegian4x4() {
  const navigate = useNavigate();
  const { playBeep, playDoubleBeep, playCompletionSound, speak } = useAudio();
  const { requestWakeLock, releaseWakeLock } = useWakeLock();
  const { sendNotification } = useNotifications();
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
      sendNotification(currentInterval.name, currentInterval.message);
      if (currentInterval.name === "High Intensity") {
        playBeep();
      } else if (currentInterval.name === "Active Recovery") {
        playDoubleBeep();
      }
    }
  }, [currentIntervalIndex, isRunning, timeLeft, sendNotification]);

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
    playCompletionSound();
    speak("Workout complete! Excellent effort!");
    sendNotification("Workout Complete!", "Excellent effort on finishing your Norwegian 4×4 session!");
    try {
      await backend.timer.createSession({
        timerType: "Norwegian 4×4",
        duration: totalDuration,
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
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="text-center">
              <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Pacee.Pro</div>
            </div>
            <div className="w-10" />
          </div>
          <h1 className="text-2xl font-bold text-foreground text-center">Norwegian 4×4</h1>
        </div>

        <InfoPanel
          title="About Norwegian 4×4"
          description="Research-proven HIIT protocol for maximum cardiovascular improvement"
          howToPerform={[
            "Use running, cycling, rowing, or other cardio equipment",
            "High intensity = 85-95% max heart rate (very challenging, can barely speak)",
            "Recovery = 60-70% max heart rate (moderate, can hold conversation)",
            "Focus on sustained intensity, not sprinting",
          ]}
          benefits={["Significant VO2 max gains", "Heart health", "Endurance"]}
          frequency="2 times per week with 48+ hours rest"
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

        <footer className="text-center text-sm text-muted-foreground pb-4">
          App Created by <a href="https://jamesharvey.blog/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">James Harvey Media</a>
        </footer>
      </div>
    </div>
  );
}
