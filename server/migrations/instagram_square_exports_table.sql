-- Instagram Square Exports: log table
-- Run in Supabase SQL editor BEFORE app boot.
-- Safe to run multiple times (IF NOT EXISTS guards).

CREATE TABLE IF NOT EXISTS instagram_square_exports (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  writing_id VARCHAR REFERENCES writings(id) ON DELETE SET NULL,
  title TEXT,
  content_snippet TEXT,
  theme VARCHAR(50) NOT NULL DEFAULT 'dark',
  font_choice VARCHAR(50) NOT NULL DEFAULT 'serif',
  downloaded_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_instagram_square_exports_user_id
  ON instagram_square_exports(user_id);

CREATE INDEX IF NOT EXISTS idx_instagram_square_exports_writing_id
  ON instagram_square_exports(writing_id);
