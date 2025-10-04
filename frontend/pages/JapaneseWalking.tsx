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
  { name: "Brisk Walk", duration: 180, message: "Brisk pace - 70 to 85% max heart rate" },
  { name: "Leisurely Walk", duration: 180, message: "Leisurely pace - recover" },
  { name: "Brisk Walk", duration: 180, message: "Brisk pace - 70 to 85% max heart rate" },
  { name: "Leisurely Walk", duration: 180, message: "Leisurely pace - recover" },
  { name: "Brisk Walk", duration: 180, message: "Brisk pace - 70 to 85% max heart rate" },
  { name: "Leisurely Walk", duration: 180, message: "Leisurely pace - recover" },
  { name: "Brisk Walk", duration: 180, message: "Brisk pace - 70 to 85% max heart rate" },
  { name: "Leisurely Walk", duration: 180, message: "Leisurely pace - recover" },
  { name: "Brisk Walk", duration: 180, message: "Brisk pace - 70 to 85% max heart rate" },
  { name: "Leisurely Walk", duration: 180, message: "Leisurely pace - recover" },
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
    if (currentIntervalIndex > 0 && isRunning) {
      reset();
      start();
    }
  }, [currentIntervalIndex]);

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
          description="Japanese Interval Walking Training (IWT) alternates between 3 minutes of brisk and leisurely walking for 30 minutes total to improve cardiovascular health, metabolism, posture, and overall fitness."
          howToPerform={[
            "Warm up for 3 minutes at a leisurely pace",
            "Brisk intervals: 70-85% max heart rate - challenging but can still speak",
            "Leisurely intervals: slower pace to allow heart rate recovery",
            "Alternate brisk and leisurely intervals 5 times (30 minutes)",
            "Cool down for final 3 minutes at leisurely pace",
            "Maintain good posture with back straight and body aligned",
          ]}
          benefits={["Improved cardiovascular health", "Enhanced metabolism", "Better posture", "Mental health benefits"]}
          frequency="3-4 times per week"
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
