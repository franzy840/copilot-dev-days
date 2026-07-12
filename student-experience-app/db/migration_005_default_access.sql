-- Changes the access model: Contact Info, Widening Access, and the Quiz
-- are now granted to every student automatically (at signup going
-- forward - this migration backfills existing students). Local
-- Induction and Final Day Feedback still require the admin to grant
-- them individually; students can now ask via a "Request Access"
-- button, tracked in the new access_requests table below.
--
-- Run each block separately in Neon's SQL editor.

-- 1
INSERT INTO section_access (user_id, section)
SELECT id, 'contactInfo' FROM users
ON CONFLICT DO NOTHING;

-- 2
INSERT INTO section_access (user_id, section)
SELECT id, 'wideningAccess' FROM users
ON CONFLICT DO NOTHING;

-- 3
INSERT INTO section_access (user_id, section)
SELECT id, 'quiz' FROM users
ON CONFLICT DO NOTHING;

-- 4
CREATE TABLE IF NOT EXISTS access_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  section TEXT NOT NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- 5
CREATE UNIQUE INDEX IF NOT EXISTS idx_access_requests_pending
  ON access_requests(user_id, section) WHERE resolved_at IS NULL;
