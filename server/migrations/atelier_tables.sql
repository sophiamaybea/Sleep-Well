-- THE ATELIER: workshop room migration
-- Run in Supabase SQL editor BEFORE app boot.
-- Safe to run multiple times (IF NOT EXISTS guards).

CREATE TABLE IF NOT EXISTS atelier_series (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  theme TEXT,
  description TEXT NOT NULL DEFAULT '',
  facilitator TEXT NOT NULL DEFAULT 'The Editors',
  genre TEXT NOT NULL DEFAULT 'any',
  total_exercises INTEGER NOT NULL DEFAULT 0,
  free_exercise_limit INTEGER NOT NULL DEFAULT 2,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by_id VARCHAR NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS atelier_exercises (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id VARCHAR NOT NULL REFERENCES atelier_series(id),
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  craft_note TEXT,
  example_line TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS atelier_responses (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id VARCHAR NOT NULL REFERENCES atelier_exercises(id),
  series_id VARCHAR NOT NULL REFERENCES atelier_series(id),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  content TEXT NOT NULL DEFAULT '',
  saved_to_garden BOOLEAN NOT NULL DEFAULT FALSE,
  garden_writing_id VARCHAR REFERENCES writings(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_atelier_exercises_series ON atelier_exercises(series_id);
CREATE INDEX IF NOT EXISTS idx_atelier_responses_user ON atelier_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_atelier_responses_exercise ON atelier_responses(exercise_id);
CREATE INDEX IF NOT EXISTS idx_atelier_series_published ON atelier_series(is_published, sort_order);

-- Verification query (run after migration to confirm):
-- SELECT table_name, COUNT(*) as col_count
-- FROM information_schema.columns
-- WHERE table_name IN ('atelier_series', 'atelier_exercises', 'atelier_responses')
-- GROUP BY table_name ORDER BY table_name;
