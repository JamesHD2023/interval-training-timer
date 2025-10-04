import { useState, useEffect } from "react";
import { Save, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import type { Preset } from "~backend/timer/create_preset";

interface PresetManagerProps {
  onLoadPreset: (preset: {
    workDuration: number;
    restDuration: number;
    intervals: number;
    warmupDuration: number;
    cooldownDuration: number;
  }) => void;
  currentConfig: {
    workDuration: number;
    restDuration: number;
    intervals: number;
    warmupDuration: number;
    cooldownDuration: number;
  };
}

export default function PresetManager({ onLoadPreset, currentConfig }: PresetManagerProps) {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [presetName, setPresetName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      const response = await backend.timer.listPresets();
      setPresets(response.presets);
    } catch (err) {
      console.error("Failed to load presets:", err);
    }
  };

  const savePreset = async () => {
    if (!presetName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a preset name",
        variant: "destructive",
      });
      return;
    }

    if (presets.length >= 5) {
      toast({
        title: "Error",
        description: "Maximum 5 presets allowed. Delete one first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await backend.timer.createPreset({
        name: presetName,
        workDuration: currentConfig.workDuration,
        restDuration: currentConfig.restDuration,
        intervals: currentConfig.intervals,
        warmupDuration: currentConfig.warmupDuration,
        cooldownDuration: currentConfig.cooldownDuration,
      });
      setPresetName("");
      await loadPresets();
      toast({
        title: "Success",
        description: "Preset saved successfully",
      });
    } catch (err) {
      console.error("Failed to save preset:", err);
      toast({
        title: "Error",
        description: "Failed to save preset",
        variant: "destructive",
      });
    }
  };

  const deletePreset = async (id: number) => {
    try {
      await backend.timer.deletePreset({ id });
      await loadPresets();
      toast({
        title: "Success",
        description: "Preset deleted",
      });
    } catch (err) {
      console.error("Failed to delete preset:", err);
      toast({
        title: "Error",
        description: "Failed to delete preset",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Saved Presets</h3>

      {presets.length > 0 && (
        <div className="space-y-2">
          {presets.map((preset) => (
            <div key={preset.id} className="flex items-center gap-2">
              <Button
                variant="outline"
                className="flex-1 h-12 justify-start"
                onClick={() =>
                  onLoadPreset({
                    workDuration: preset.workDuration,
                    restDuration: preset.restDuration,
                    intervals: preset.intervals,
                    warmupDuration: preset.warmupDuration,
                    cooldownDuration: preset.cooldownDuration,
                  })
                }
              >
                <div className="text-left">
                  <div className="font-medium">{preset.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {preset.intervals}x {preset.workDuration}s work / {preset.restDuration}s rest
                  </div>
                </div>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => deletePreset(preset.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="preset-name">Save Current Configuration</Label>
        <div className="flex gap-2">
          <Input
            id="preset-name"
            placeholder="Preset name"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            className="h-12"
          />
          <Button onClick={savePreset} className="h-12" disabled={presets.length >= 5}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
    </Card>
  );
}
