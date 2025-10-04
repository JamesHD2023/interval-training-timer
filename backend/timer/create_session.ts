import { api } from "encore.dev/api";
import db from "../db";

export interface CreateSessionRequest {
  timerType: string;
  duration: number;
}

export interface Session {
  id: number;
  timerType: string;
  duration: number;
  completedAt: Date;
}

// Creates a new completed session record.
export const createSession = api<CreateSessionRequest, Session>(
  { expose: true, method: "POST", path: "/sessions" },
  async (req) => {
    const row = await db.queryRow<Session>`
      INSERT INTO sessions (timer_type, duration)
      VALUES (${req.timerType}, ${req.duration})
      RETURNING id, timer_type AS "timerType", duration, completed_at AS "completedAt"
    `;
    return row!;
  }
);
