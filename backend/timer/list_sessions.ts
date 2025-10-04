import { api } from "encore.dev/api";
import db from "../db";
import type { Session } from "./create_session";

export interface ListSessionsResponse {
  sessions: Session[];
}

// Retrieves all completed sessions, ordered by completion date (latest first).
export const listSessions = api<void, ListSessionsResponse>(
  { expose: true, method: "GET", path: "/sessions" },
  async () => {
    const sessions = await db.queryAll<Session>`
      SELECT id, timer_type AS "timerType", duration, completed_at AS "completedAt"
      FROM sessions
      ORDER BY completed_at DESC
      LIMIT 50
    `;
    return { sessions };
  }
);
