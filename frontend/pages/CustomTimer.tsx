import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TimerDisplay from "@/components/TimerDisplay";
import InfoPanel from "@/components/InfoPanel";
import PresetManager from "@/components/PresetManager";
import { useTimer } from "@/hooks/useTimer";
import { useAudio } from "@/hooks/useAudio";
import { useWakeLock } from "@/hooks/useWakeLock";
import { useNotifications } from "@/hooks/useNotifications";
import backend from "~backend/client";

interface CustomInterval {
  name: string;
  duration: number;
  message: string;
}

export default function CustomTimer() {
  const navigate = useNavigate();
  const { playBeep, playDoubleBeep, playCompletionSound, speak } = useAudio();
  const { requestWakeLock, releaseWakeLock } = useWakeLock();
  const { sendNotification } = useNotifications();

  const [showConfig, setShowConfig] = useState(true);
  const [intervals, setIntervals] = useState(3);
  const [workDuration, setWorkDuration] = useState(30);
  const [restDuration, setRestDuration] = useState(15);
  const [warmupDuration, setWarmupDuration] = useState(0);
  const [cooldownDuration, setCooldownDuration] = useState(0);

  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
  const [timerIntervals, setTimerIntervals] = useState<CustomInterval[]>([]);

  const generateIntervals = () => {
    const generated: CustomInterval[] = [];

    if (warmupDuration > 0) {
      generated.push({
        name: "Warm-up",
        duration: warmupDuration,
        message: "Warm-up begins",
      });
    }

    for (let i = 0; i < intervals; i++) {
      generated.push({
        name: "Work",
        duration: workDuration,
        message: `Work interval ${i + 1} - go!`,
      });
      if (i < intervals - 1) {
        generated.push({
          name: "Rest",
          duration: restDuration,
          message: "Rest period",
        });
      }
    }

    if (cooldownDuration > 0) {
      generated.push({
        name: "Cool-down",
        duration: cooldownDuration,
        message: "Cool-down begins",
      });
    }

    return generated;
  };

  const handleStart = () => {
    const generated = generateIntervals();
    setTimerIntervals(generated);
    setCurrentIntervalIndex(0);
    setShowConfig(false);
  };

  const currentInterval = timerIntervals[currentIntervalIndex];
  const totalDuration = timerIntervals.reduce((sum, int) => sum + int.duration, 0);
  const elapsedTotal = timerIntervals
    .slice(0, currentIntervalIndex)
    .reduce((sum, int) => sum + int.duration, 0);

  const { timeLeft, isRunning, start, pause, reset } = useTimer(
    currentInterval?.duration || 0,
    () => {
      if (currentIntervalIndex < timerIntervals.length - 1) {
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
    if (isRunning && currentInterval && timeLeft === currentInterval.duration) {
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
    speak("Workout complete! You did it!");
    sendNotification("Workout Complete!", "You did it! Great job on finishing your custom interval session!");
    try {
      await backend.timer.createSession({
        timerType: "Custom",
        duration: totalDuration,
      });
    } catch (err) {
      console.error("Failed to save session:", err);
    }
  };

  const handleReset = () => {
    reset();
    setCurrentIntervalIndex(0);
    setShowConfig(true);
    releaseWakeLock();
  };

  const progress = currentInterval
    ? ((elapsedTotal + (currentInterval.duration - timeLeft)) / totalDuration) * 100
    : 0;

  const loadPreset = (preset: {
    workDuration: number;
    restDuration: number;
    intervals: number;
    warmupDuration: number;
    cooldownDuration: number;
  }) => {
    setWorkDuration(preset.workDuration);
    setRestDuration(preset.restDuration);
    setIntervals(preset.intervals);
    setWarmupDuration(preset.warmupDuration);
    setCooldownDuration(preset.cooldownDuration);
  };

  if (showConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
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
            <h1 className="text-2xl font-bold text-foreground text-center">Custom Timer</h1>
          </div>

          <InfoPanel
            title="HIIT Guidelines"
            description="A HIIT workout involves short bursts of intense, maximum-effort exercise followed by brief recovery periods, repeated for a set duration, typically lasting 20-45 minutes including warm-up and cool-down."
            howToPerform={[
              "Warm-Up (5 minutes): Light cardio, such as jogging on the spot, star jumps, or dynamic stretches, to prepare your muscles.",
              "High-Intensity Interval (HII): Alternate between periods of intense exercise and periods of recovery or lower-intensity activity.",
              "Work Interval: Perform an exercise at maximum effort (9 out of 10 on a perceived exertion scale), getting your heart rate up significantly.",
              "Rest/Recovery Interval: Rest, do light walking, or perform another low-intensity exercise to recover.",
              "Repeat Cycles: Repeat the work and recovery intervals several times.",
              "Cool-Down (5 minutes): Gentle movement, like a light jog on the spot, and static stretching to help your heart rate return to normal and improve flexibility.",
              "Example HIIT Workout for Beginners: Warm-up (5 minutes of light jogging on the spot). Workout (10 minutes): 30 seconds Bodyweight Squats, 30 seconds Rest, 30 seconds Burpees, 30 seconds Rest, 30 seconds Mountain Climbers, 30 seconds Rest, 30 seconds High Knees, 30 seconds Rest, 30 seconds Push Ups, 30 seconds Rest. Cool-down (5 minutes of gentle stretching).",
              "Listen to Your Body: If an exercise doesn't feel right, modify it or take a longer rest. Proper form is more important than pushing through pain.",
              "Adjust for Your Fitness Level: Start with shorter work intervals and longer rests, and gradually increase the work time or decrease the rest as you improve.",
              "Use a Timer: A workout timer or app can be very helpful for signaling your work and rest periods.",
              "Vary Your Exercises: You can use bodyweight exercises, cardio equipment like treadmills or bikes, or even weights to increase the intensity.",
            ]}
            benefits={["Customizable to your fitness level", "Flexible duration", "Adaptable to any exercise"]}
            frequency="Based on your training program"
          />

          <Card className="p-6 space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="intervals">Number of Intervals (1-20)</Label>
                <Input
                  id="intervals"
                  type="number"
                  min="1"
                  max="20"
                  value={intervals}
                  onChange={(e) => setIntervals(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="h-14 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="work">Work Duration (seconds)</Label>
                <Input
                  id="work"
                  type="number"
                  min="15"
                  max="1800"
                  value={workDuration}
                  onChange={(e) => setWorkDuration(Math.min(1800, Math.max(15, parseInt(e.target.value) || 30)))}
                  className="h-14 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rest">Rest Duration (seconds)</Label>
                <Input
                  id="rest"
                  type="number"
                  min="15"
                  max="1800"
                  value={restDuration}
                  onChange={(e) => setRestDuration(Math.min(1800, Math.max(15, parseInt(e.target.value) || 15)))}
                  className="h-14 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warmup">Warm-up (seconds, optional)</Label>
                <Input
                  id="warmup"
                  type="number"
                  min="0"
                  max="900"
                  value={warmupDuration}
                  onChange={(e) => setWarmupDuration(Math.min(900, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="h-14 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cooldown">Cool-down (seconds, optional)</Label>
                <Input
                  id="cooldown"
                  type="number"
                  min="0"
                  max="900"
                  value={cooldownDuration}
                  onChange={(e) => setCooldownDuration(Math.min(900, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="h-14 text-lg"
                />
              </div>
            </div>

            <Button onClick={handleStart} className="w-full h-16 text-xl" size="lg">
              <Plus className="w-6 h-6 mr-2" />
              Start Timer
            </Button>
          </Card>

          <PresetManager
            onLoadPreset={loadPreset}
            currentConfig={{
              workDuration,
              restDuration,
              intervals,
              warmupDuration,
              cooldownDuration,
            }}
          />

          <footer className="text-center text-sm text-muted-foreground pb-4">
            App Created by <a href="https://jamesharvey.blog/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">James Harvey Media</a>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={handleReset}>
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="text-center">
              <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Pacee.Pro</div>
            </div>
            <div className="w-10" />
          </div>
          <h1 className="text-2xl font-bold text-foreground text-center">Custom Timer</h1>
        </div>

        <TimerDisplay
          timeLeft={timeLeft}
          intervalName={currentInterval?.name || ""}
          intervalNumber={currentIntervalIndex + 1}
          totalIntervals={timerIntervals.length}
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
