-- Per-student, per-section access control. A row's presence means the
-- admin has unlocked that section for that student; no row means locked.
-- Every student starts fully locked out of all 5 sections until the
-- admin grants each one individually from the Users tab.
--
-- Run each block separately in Neon's SQL editor.

-- 1
CREATE TABLE IF NOT EXISTS section_access (
  user_id INTEGER NOT NULL REFERENCES users(id),
  section TEXT NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, section)
);
