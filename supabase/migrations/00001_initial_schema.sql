-- ============================================================
-- Pythmaster: Complete Database Schema
-- Phase 1 Migration — All 16 core tables
-- ============================================================

-- 1. Enum: Mission Status
DO $$ BEGIN
  CREATE TYPE mission_status AS ENUM (
    'LOCKED',
    'AVAILABLE',
    'IN_PROGRESS',
    'CODE_REVIEW',
    'QUIZ',
    'PROJECT',
    'COMPLETED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 2. profiles — extends auth.users (Nhost Auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  current_level INTEGER NOT NULL DEFAULT 1,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  total_coding_minutes INTEGER NOT NULL DEFAULT 0,
  preferred_learning_style TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 3. missions — curriculum definitions
-- ============================================================
CREATE TABLE IF NOT EXISTS missions (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  phase TEXT NOT NULL,
  difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  estimated_minutes INTEGER NOT NULL,
  xp INTEGER NOT NULL,
  goal TEXT NOT NULL,
  learning_objectives JSONB NOT NULL DEFAULT '[]',
  prerequisites INTEGER[] NOT NULL DEFAULT '{}',
  project_feature TEXT NOT NULL,
  official_sources TEXT[] NOT NULL DEFAULT '{}',
  required_quiz_score INTEGER NOT NULL DEFAULT 80,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_missions_phase ON missions(phase);
CREATE INDEX IF NOT EXISTS idx_missions_order ON missions(order_index);

-- ============================================================
-- 4. mission_progress — per-user mission state
-- ============================================================
CREATE TABLE IF NOT EXISTS mission_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mission_id INTEGER NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  status mission_status NOT NULL DEFAULT 'LOCKED',
  lesson_viewed BOOLEAN NOT NULL DEFAULT false,
  examples_executed BOOLEAN NOT NULL DEFAULT false,
  challenge_passed BOOLEAN NOT NULL DEFAULT false,
  code_review_completed BOOLEAN NOT NULL DEFAULT false,
  quiz_passed BOOLEAN NOT NULL DEFAULT false,
  quiz_score INTEGER,
  project_updated BOOLEAN NOT NULL DEFAULT false,
  summary_generated BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  attempts INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, mission_id)
);

CREATE INDEX IF NOT EXISTS idx_mission_progress_user ON mission_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_mission_progress_status ON mission_progress(user_id, status);

-- ============================================================
-- 5. generated_lessons — AI-generated lesson content
-- ============================================================
CREATE TABLE IF NOT EXISTS generated_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mission_id INTEGER NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  python_version TEXT NOT NULL,
  library_versions JSONB DEFAULT '{}',
  documentation_version TEXT NOT NULL,
  prompt_version TEXT NOT NULL,
  source_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, mission_id)
);

CREATE INDEX IF NOT EXISTS idx_lessons_user_mission ON generated_lessons(user_id, mission_id);

-- ============================================================
-- 6. quizzes — generated quiz questions
-- ============================================================
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id INTEGER NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  questions JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quizzes_mission ON quizzes(mission_id);

-- ============================================================
-- 7. quiz_attempts — user quiz results
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  mission_id INTEGER NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  answers JSONB NOT NULL,
  passed BOOLEAN NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id, mission_id);

-- ============================================================
-- 8. code_reviews — AI code review feedback
-- ============================================================
CREATE TABLE IF NOT EXISTS code_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mission_id INTEGER NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  challenge_id TEXT NOT NULL,
  feedback TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_code_reviews_user ON code_reviews(user_id, mission_id);

-- ============================================================
-- 9. challenge_attempts — coding challenge submissions
-- ============================================================
CREATE TABLE IF NOT EXISTS challenge_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mission_id INTEGER NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL,
  code TEXT NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT false,
  hints_used INTEGER NOT NULL DEFAULT 0,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_challenge_attempts_user ON challenge_attempts(user_id, mission_id);

-- ============================================================
-- 10. badges — user achievements
-- ============================================================
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  criteria JSONB NOT NULL DEFAULT '{}',
  UNIQUE(user_id, badge_key)
);

CREATE INDEX IF NOT EXISTS idx_badges_user ON badges(user_id);

-- ============================================================
-- 11. xp_history — XP transaction log
-- ============================================================
CREATE TABLE IF NOT EXISTS xp_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  mission_id INTEGER REFERENCES missions(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_xp_history_user ON xp_history(user_id);

-- ============================================================
-- 12. resume_skills — resume readiness tracker
-- ============================================================
CREATE TABLE IF NOT EXISTS resume_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  level TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill_name)
);

CREATE INDEX IF NOT EXISTS idx_resume_skills_user ON resume_skills(user_id);

-- ============================================================
-- 13. project_versions — Crypto Exchange Analyzer version history
-- ============================================================
CREATE TABLE IF NOT EXISTS project_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  feature TEXT NOT NULL,
  mission_id INTEGER NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_versions_user ON project_versions(user_id);

-- ============================================================
-- 14. knowledge_cache — cached official documentation
-- ============================================================
CREATE TABLE IF NOT EXISTS knowledge_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  source_url TEXT NOT NULL,
  content TEXT NOT NULL,
  python_version TEXT NOT NULL,
  library_version TEXT,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_cache_topic ON knowledge_cache(topic);

-- ============================================================
-- 15. prompt_versions — versioned AI prompts
-- ============================================================
CREATE TABLE IF NOT EXISTS prompt_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_key TEXT NOT NULL,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prompt_versions_key ON prompt_versions(prompt_key);
CREATE INDEX IF NOT EXISTS idx_prompt_versions_active ON prompt_versions(active);

-- ============================================================
-- 16. analytics — usage telemetry
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  mission_id INTEGER REFERENCES missions(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics(event_type);

-- ============================================================
-- Permissions are managed via Hasura permission system
-- See: https://hasura.io/docs/latest/auth/authorization/permissions/
-- ============================================================

-- ============================================================
-- Updated-at trigger helper
-- ============================================================
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated ON profiles;
CREATE TRIGGER profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS mission_progress_updated ON mission_progress;
CREATE TRIGGER mission_progress_updated
  BEFORE UPDATE ON mission_progress
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();
