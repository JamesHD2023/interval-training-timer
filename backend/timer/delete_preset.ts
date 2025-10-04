import { api } from "encore.dev/api";
import db from "../db";

export interface DeletePresetRequest {
  id: number;
}

// Deletes a custom timer preset.
export const deletePreset = api<DeletePresetRequest, void>(
  { expose: true, method: "DELETE", path: "/presets/:id" },
  async (req) => {
    await db.exec`DELETE FROM presets WHERE id = ${req.id}`;
  }
);
