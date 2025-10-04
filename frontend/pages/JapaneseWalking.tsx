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
  { name: "Warm-up", duration: 180, message: "Begin warm-up walk" },
  { name: "Fast Pace", duration: 180, message: "Fast pace - go!" },
  { name: "Recovery", duration: 180, message: "Recovery pace" },
  { name: "Fast Pace", duration: 180, message: "Fast pace - go!" },
  { name: "Recovery", duration: 180, message: "Recovery pace" },
  { name: "Fast Pace", duration: 180, message: "Fast pace - go!" },
  { name: "Recovery", duration: 180, message: "Recovery pace" },
  { name: "Fast Pace", duration: 180, message: "Fast pace - go!" },
  { name: "Recovery", duration: 180, message: "Recovery pace" },
  { name: "Fast Pace", duration: 180, message: "Fast pace - go!" },
  { name: "Cool-down", duration: 180, message: "Final cool-down" },
];

export default function JapaneseWalking() {
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
        pause();
        handleComplete();
      }
    }
  );

  useEffect(() => {
    if (isRunning && timeLeft === currentInterval.duration) {
      speak(currentInterval.message);
      sendNotification(currentInterval.name, currentInterval.message);
      playBeep();
    }
  }, [currentIntervalIndex, isRunning, timeLeft, currentInterval, sendNotification, playBeep, speak]);

  useEffect(() => {
    if (isRunning) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
    return () => { releaseWakeLock(); };
  }, [isRunning, requestWakeLock, releaseWakeLock]);

  const handleComplete = async () => {
    releaseWakeLock();
    playCompletionSound();
    speak("Workout complete! Great job!");
    sendNotification("Workout Complete!", "Great job on finishing your Japanese Walking session!");
    try {
      await backend.timer.createSession({
        timerType: "Japanese Walking",
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
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
          <h1 className="text-2xl font-bold text-foreground text-center">Japanese Walking</h1>
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

        <footer className="text-center text-sm text-muted-foreground pb-4">
          App Created by <a href="https://jamesharvey.blog/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">James Harvey Media</a>
        </footer>
      </div>
    </div>
  );
}
