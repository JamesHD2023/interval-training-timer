import { api } from "encore.dev/api";
import db from "../db";

export interface CreatePresetRequest {
  name: string;
  workDuration: number;
  restDuration: number;
  intervals: number;
  warmupDuration: number;
  cooldownDuration: number;
}

export interface Preset {
  id: number;
  name: string;
  workDuration: number;
  restDuration: number;
  intervals: number;
  warmupDuration: number;
  cooldownDuration: number;
  createdAt: Date;
}

// Creates a new custom timer preset.
export const createPreset = api<CreatePresetRequest, Preset>(
  { expose: true, method: "POST", path: "/presets" },
  async (req) => {
    const row = await db.queryRow<Preset>`
      INSERT INTO presets (name, work_duration, rest_duration, intervals, warmup_duration, cooldown_duration)
      VALUES (${req.name}, ${req.workDuration}, ${req.restDuration}, ${req.intervals}, ${req.warmupDuration}, ${req.cooldownDuration})
      RETURNING id, name, work_duration AS "workDuration", rest_duration AS "restDuration", 
                intervals, warmup_duration AS "warmupDuration", cooldown_duration AS "cooldownDuration", 
                created_at AS "createdAt"
    `;
    return row!;
  }
);
