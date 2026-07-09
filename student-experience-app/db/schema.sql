-- Run this once against the Vercel Postgres database attached to this
-- project (Vercel dashboard -> Storage -> your DB -> Query, or via psql
-- using the connection string from `vercel env pull`).
--
-- Five separate tables so Day 1's four topics are stored separately even
-- though students fill them in as one combined form, plus one table for
-- the Final Day feedback form.

CREATE TABLE IF NOT EXISTS contact_info (
  id SERIAL PRIMARY KEY,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
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

CREATE TABLE IF NOT EXISTS widening_access (
  id SERIAL PRIMARY KEY,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
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

CREATE TABLE IF NOT EXISTS local_induction (
  id SERIAL PRIMARY KEY,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  student_name TEXT NOT NULL,
  supervisor_name TEXT NOT NULL,
  department TEXT NOT NULL,
  risks_notes TEXT,
  esignature TEXT NOT NULL,
  induction_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS quiz_responses (
  id SERIAL PRIMARY KEY,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  student_name TEXT NOT NULL,
  answers JSONB NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
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
