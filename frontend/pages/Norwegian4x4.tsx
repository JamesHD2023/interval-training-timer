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
  { name: "Warm-up", duration: 240, message: "Warm-up - light intensity with dynamic stretches" },
  { name: "High Intensity 1", duration: 240, message: "High intensity - 85 to 95% max heart rate" },
  { name: "Recovery 1", duration: 180, message: "Light recovery - 60 to 70% max heart rate" },
  { name: "High Intensity 2", duration: 240, message: "High intensity - 85 to 95% max heart rate" },
  { name: "Recovery 2", duration: 180, message: "Light recovery - 60 to 70% max heart rate" },
  { name: "High Intensity 3", duration: 240, message: "High intensity - 85 to 95% max heart rate" },
  { name: "Recovery 3", duration: 180, message: "Light recovery - 60 to 70% max heart rate" },
  { name: "High Intensity 4", duration: 240, message: "Final high intensity - 85 to 95% max heart rate" },
  { name: "Cool-down", duration: 300, message: "Cool-down - slowly bring heart rate down" },
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
          description="The Norwegian 4x4 is a high-intensity interval training (HIIT) method involving four, four-minute high-intensity intervals at 85-95% of your maximum heart rate, each followed by three minutes of low-intensity active recovery, after an initial warm-up and before a cool-down. This protocol is designed to significantly improve VO₂ max, a key indicator of cardiovascular health and longevity."
          howToPerform={[
            "Warm-up (4 minutes): Start with a low-intensity warm-up, such as light jogging or dynamic stretches, to prepare your body for the workout",
            "High-Intensity Interval (4 minutes): For each of the four intervals, perform a cardio exercise of your choice (running, cycling, swimming, etc.) at 85-95% of your maximum heart rate. The goal is to reach and sustain this high intensity",
            "Active Recovery (3 minutes): After each 4-minute interval, engage in light activity, like brisk walking or light pedaling, to bring your heart rate down to 60-70% of your max",
            "Repeat Intervals: Complete the 4-minute high-intensity interval and 3-minute active recovery phase for a total of four times",
            "Cool-down: After the final interval and recovery period, perform a cool-down to slowly bring your heart rate down further and include gentle stretching",
          ]}
          tips={[
            "Cardio Exercise Choice: The 4x4 workout can be adapted to various cardio exercises, including running, swimming, cycling, and rowing",
            "Heart Rate Zones: It's crucial to monitor your heart rate to ensure you are in the correct intensity zones for both the high-intensity and recovery periods",
            "Research-Backed: The Norwegian 4x4 method was popularized by researchers at the Norwegian University of Science and Technology and has been shown to be highly effective for improving VO₂ max",
            "Consistency: Performing the Norwegian 4x4 protocol once a week can lead to significant fitness improvements, according to one study",
            "Listen to Your Body: Pay attention to your body's signals and adjust the intensity or duration as needed, especially if you are new to high-intensity training",
          ]}
          benefits={[
            "Significant VO₂ max improvement",
            "Enhanced cardiovascular fitness",
            "Improved heart function",
            "Better metabolic health",
          ]}
          frequency="Once a week for significant improvements, or 2-3 times per week with at least one rest day between sessions"
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
