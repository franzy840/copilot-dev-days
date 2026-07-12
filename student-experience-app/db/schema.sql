-- Run this once against the Postgres database attached to this project
-- (Neon/Vercel Storage -> Query tab, or via psql).
--
-- Neon's SQL editor can't run multiple statements pasted together
-- ("cannot insert multiple commands into a prepared statement") - run
-- each block below separately, in order.
--
-- Already ran an earlier version of this file against a live database?
-- Use db/migration_002_auth.sql and db/migration_003_passwords.sql
-- instead - they only add what's new, without touching existing data.

-- 1
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2
-- Five separate tables so Day 1's four topics are stored separately even
-- though students fill them in as one combined form, plus one table for
-- the Final Day feedback form.
CREATE TABLE IF NOT EXISTS contact_info (
  id SERIAL PRIMARY KEY,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id INTEGER REFERENCES users(id),
  student_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  town_city TEXT NOT NULL,
  postcode TEXT NOT NULL,
  mobile TEXT NOT NULL,
  email TEXT NOT NULL,
  nok_name TEXT NOT NULL,
  nok_relationship TEXT NOT NULL,
  nok_work_phone TEXT,
  nok_home_phone TEXT
);

-- 3
CREATE TABLE IF NOT EXISTS widening_access (
  id SERIAL PRIMARY KEY,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id INTEGER REFERENCES users(id),
  student_name TEXT NOT NULL,
  age TEXT,
  gender TEXT,
  trans_identification TEXT,
  sexual_orientation TEXT,
  disabilities TEXT,
  ethnicity TEXT,
  household_occupation_at_14 TEXT,
  school_type_11_to_15 TEXT,
  free_school_meals TEXT,
  parents_attended_university TEXT
);

-- 4
CREATE TABLE IF NOT EXISTS local_induction (
  id SERIAL PRIMARY KEY,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id INTEGER REFERENCES users(id),
  student_name TEXT NOT NULL,
  supervisor_name TEXT NOT NULL,
  department TEXT NOT NULL,
  risks_notes TEXT,
  esignature TEXT NOT NULL,
  induction_date DATE NOT NULL
);

-- 5
CREATE TABLE IF NOT EXISTS quiz_responses (
  id SERIAL PRIMARY KEY,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id INTEGER REFERENCES users(id),
  student_name TEXT NOT NULL,
  answers JSONB NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL
);

-- 6
CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id INTEGER REFERENCES users(id),
  student_name TEXT,
  date_from DATE,
  date_to DATE,
  hospital TEXT,
  team TEXT,
  ratings JSONB NOT NULL,
  career_influence TEXT,
  most_useful TEXT,
  suggestions TEXT,
  concern TEXT,
  career_path_use TEXT,
  memorable_mention TEXT,
  other_comments TEXT
);

-- 7
CREATE INDEX IF NOT EXISTS idx_quiz_responses_user_id ON quiz_responses(user_id);

-- 8
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);

-- 9
-- Per-student, per-section access control. A row's presence means the
-- admin has unlocked that section for that student; no row means locked.
-- Every student starts fully locked out of all 5 sections until the
-- admin grants each one individually from the Users tab.
CREATE TABLE IF NOT EXISTS section_access (
  user_id INTEGER NOT NULL REFERENCES users(id),
  section TEXT NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, section)
);
