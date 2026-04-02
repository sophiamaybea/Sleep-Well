-- Migration: poem_weaving_tables
-- Creates the three tables needed for the Poem Weaving collaborative poetry feature.
-- Safe to run multiple times (uses CREATE TABLE IF NOT EXISTS).
-- Run this in the Supabase SQL editor before deploying.

-- 1. poem_weaves — the collaborative poem session
CREATE TABLE IF NOT EXISTS poem_weaves (
  id          varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text    NOT NULL,
  prompt      text    NOT NULL DEFAULT '',
  initiator_id varchar NOT NULL REFERENCES users(id),
  circle_id   varchar REFERENCES circles(id),
  form        text    NOT NULL DEFAULT 'free',
  max_contributors           integer NOT NULL DEFAULT 6,
  max_stanzas_per_contributor integer NOT NULL DEFAULT 3,
  status      text    NOT NULL DEFAULT 'open',
  writing_id  varchar REFERENCES writings(id),
  is_national_poetry_day boolean NOT NULL DEFAULT false,
  created_at  timestamp DEFAULT now(),
  updated_at  timestamp DEFAULT now()
);

-- 2. weave_stanzas — individual stanza contributions
CREATE TABLE IF NOT EXISTS weave_stanzas (
  id         varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  weave_id   varchar NOT NULL REFERENCES poem_weaves(id),
  author_id  varchar NOT NULL REFERENCES users(id),
  content    text    NOT NULL,
  turn_order integer NOT NULL,
  is_pinned  boolean NOT NULL DEFAULT false,
  created_at timestamp DEFAULT now()
);

-- 3. weave_invitations — tracks who has been invited / accepted
CREATE TABLE IF NOT EXISTS weave_invitations (
  id         varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  weave_id   varchar NOT NULL REFERENCES poem_weaves(id),
  user_id    varchar NOT NULL REFERENCES users(id),
  status     text    NOT NULL DEFAULT 'pending',
  created_at timestamp DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_poem_weaves_initiator   ON poem_weaves(initiator_id);
CREATE INDEX IF NOT EXISTS idx_poem_weaves_status       ON poem_weaves(status);
CREATE INDEX IF NOT EXISTS idx_weave_stanzas_weave      ON weave_stanzas(weave_id);
CREATE INDEX IF NOT EXISTS idx_weave_invitations_weave  ON weave_invitations(weave_id);
CREATE INDEX IF NOT EXISTS idx_weave_invitations_user   ON weave_invitations(user_id);
