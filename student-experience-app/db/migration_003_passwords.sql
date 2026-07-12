-- Switches student login from magic-link email to email + password,
-- with admin-triggered resets (no email involved). Run each block
-- separately in Neon's SQL editor, in order.

-- 1
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 2
-- login_tokens is no longer used (magic-link login is gone) - safe to
-- drop, it never held anything but short-lived, already-expired tokens.
DROP TABLE IF EXISTS login_tokens;
