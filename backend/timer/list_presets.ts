import { api } from "encore.dev/api";
import db from "../db";
import type { Preset } from "./create_preset";

export interface ListPresetsResponse {
  presets: Preset[];
}

// Retrieves all saved custom timer presets.
export const listPresets = api<void, ListPresetsResponse>(
  { expose: true, method: "GET", path: "/presets" },
  async () => {
    const presets = await db.queryAll<Preset>`
      SELECT id, name, work_duration AS "workDuration", rest_duration AS "restDuration", 
             intervals, warmup_duration AS "warmupDuration", cooldown_duration AS "cooldownDuration", 
             created_at AS "createdAt"
      FROM presets
      ORDER BY created_at DESC
      LIMIT 5
    `;
    return { presets };
  }
);
