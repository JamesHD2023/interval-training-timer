CREATE TABLE presets (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  work_duration INTEGER NOT NULL,
  rest_duration INTEGER NOT NULL,
  intervals INTEGER NOT NULL,
  warmup_duration INTEGER NOT NULL DEFAULT 0,
  cooldown_duration INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sessions (
  id BIGSERIAL PRIMARY KEY,
  timer_type TEXT NOT NULL,
  duration INTEGER NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
