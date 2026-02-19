-- =========================================================
-- Keys2Balance MVP Schema (PostgreSQL)
-- Tables: users, modules, progress, assessments, assessment_responses
-- =========================================================

BEGIN;

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================
-- 1) users
-- =========================
CREATE TABLE IF NOT EXISTS users (
  user_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  email          TEXT NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL,

  -- profile fields
  first_name     TEXT,
  last_name      TEXT,
  gender         TEXT,
  date_of_birth  DATE,
  phone          TEXT,
  address        TEXT,
  city           TEXT,
  post_code      TEXT,
  country        TEXT,
  avatar_url     TEXT,

  -- account meta
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- 2) modules
-- =========================
CREATE TABLE IF NOT EXISTS modules (
  module_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT
);

-- =========================
-- 3) progress
-- Tracks completion per participant per module
-- =========================
CREATE TABLE IF NOT EXISTS progress (
  module_id        UUID NOT NULL REFERENCES modules(module_id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,

  is_completed     BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at     TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (module_id, user_id)
);

-- =========================
-- 4) assessments
-- Assessment attached to a module
-- =========================
CREATE TABLE IF NOT EXISTS assessments (
  assessment_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id        UUID NOT NULL REFERENCES modules(module_id) ON DELETE CASCADE,

  title            TEXT NOT NULL,
  description      TEXT,
  assessment_json  JSONB NOT NULL,  -- form definition (questions/options/types)

  is_required      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- 5) assessment_responses
-- One submitted response per user per assessment
-- =========================
CREATE TABLE IF NOT EXISTS assessment_responses (
  assessment_response_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  assessment_id   UUID NOT NULL REFERENCES assessments(assessment_id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,

  answers_json    JSONB NOT NULL,   -- user answers payload
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (assessment_id, user_id)
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_assessments_module
  ON assessments(module_id);

CREATE INDEX IF NOT EXISTS idx_assessment_responses_user_time
  ON assessment_responses(user_id, submitted_at DESC);

COMMIT;
