-- Adds user accounts + login tokens, and links every existing response
-- table to the student who submitted it.
--
-- Neon's SQL editor can't run multiple statements pasted together
-- ("cannot insert multiple commands into a prepared statement") - run
-- each numbered block below separately, in order.

-- 1
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2
CREATE TABLE IF NOT EXISTS login_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3
ALTER TABLE contact_info ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);

-- 4
ALTER TABLE widening_access ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);

-- 5
ALTER TABLE local_induction ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);

-- 6
ALTER TABLE quiz_responses ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);

-- 7
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);

-- 8
CREATE INDEX IF NOT EXISTS idx_quiz_responses_user_id ON quiz_responses(user_id);

-- 9
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
