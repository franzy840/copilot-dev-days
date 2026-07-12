# Student Work Experience Forms App

A web app for collecting Work Experience student paperwork, with student
accounts and an admin dashboard:

- **`/signup`** / **`/login`** — student accounts: email + password, no
  email verification step. If a student loses their password, the admin
  resets it from the dashboard (see below) — no email dependency.
- **`/day1`** — logged-in students only. A hub linking to 4 independent
  sections — Contact Info, the Widening Access Participation Survey,
  Local Induction sign-off, and the safety Induction Quiz (auto-graded) —
  each stored in its own database table / Excel tab. Contact Info,
  Widening Access, and the Quiz are **unlocked automatically at signup**;
  **Local Induction requires the admin to grant it** per student. A
  student can tap **Request Access** on a locked section, which shows up
  for the admin in the **Notifications** tab. Each section can only be
  submitted once.
- **`/feedback`** — logged-in students only, and **locked until the
  admin grants the Feedback section** for that student (same
  Request Access flow as Local Induction) — enforced both in the UI and
  server-side in `api/feedback.ts`, independent of Day 1 section access.
- **`/admin/login`** + **`/admin`** — admin-only dashboard (see below).

Every submission is written to a Postgres database and triggers an
email to the admin **only** (`franzy840@gmail.com`, see
`shared/constants.ts`) with the full dataset attached as a real
`.xlsx` workbook (one sheet per topic). If a student flags a
safeguarding concern on the feedback form, an additional urgent email
fires immediately.

## Admin dashboard (`/admin`)

Sign in at `/admin/login` with username `hansel` (see `ADMIN_USERNAME`
in `shared/constants.ts` if that ever needs to change) and the
`ADMIN_PASSWORD` you set (see setup below — this is a separate
env-var-based login, not a database account, and not the same as
`ADMIN_EMAIL` which is only where notification emails go). Four tabs:

- **Analytics** — registered/completed counts, quiz score distribution,
  average feedback rating per statement, and Widening Access breakdowns
  (age, gender, ethnicity, disabilities), all as simple bar charts.
- **Notifications** — every pending **Request Access** a student has
  sent (student name/email, section requested, when), with **Grant
  access** and **Dismiss** buttons per row. The tab label shows a live
  count (e.g. "Notifications (2)") so new requests are easy to spot.
- **Users** — every student account, with Day 1 / Feedback completion
  status, a **Manage access** toggle panel per row (5 switches — one
  per section — to grant/revoke that student's access; a "Submitted"
  badge shows once they've completed it), and a **Reset password**
  button (generates a new password shown once on screen — copy it and
  pass it to the student yourself; there's no email step to fail).
- **Responses** — the raw rows for each of the 5 tables, joined with the
  submitting student's account email.

This is unrelated to the rest of the `copilot-dev-days` repo (a Copilot
Dev Days workshop app) — it's a self-contained subfolder with its own
`package.json`, deployed as its own Vercel project.

## Stack

- Frontend: Vite + React + React Router, plain CSS (no UI framework).
- Backend: Vercel Serverless Functions (`api/*.ts`), Node runtime.
- Database: Vercel Postgres (Storage tab in the Vercel dashboard).
- Excel export: `exceljs`, generated on demand from the database.
- Email: `nodemailer` over Gmail SMTP, using an **App Password** —
  not your normal Gmail password.
- Auth: email + password for students (`bcryptjs` hashing,
  `jsonwebtoken` + `cookie` for the session), with admin-triggered
  resets (no email step). Env-var password login for the single admin
  account (no database row for admin).

## One-time deployment setup

### 1. Create the Vercel project

1. Sign in at [vercel.com](https://vercel.com) with GitHub.
2. **Add New… → Project**, import `franzy840/copilot-dev-days`.
3. Under **Root Directory**, set it to `student-experience-app` (this
   is a monorepo — the rest of the repo is a different, unrelated app).
4. Framework preset should auto-detect as **Vite**. Leave build command
   (`npm run build`) and output directory (`dist`) as default.
5. Don't deploy yet — add the database and secrets first (next steps),
   then deploy.

### 2. Add the database

1. In the Vercel project → **Storage** tab → **Create Database** →
   **Postgres**. Accept the defaults and connect it to this project.
   Vercel automatically adds a `POSTGRES_URL` environment variable —
   you don't need to copy/paste anything.
2. Open the database's **Query** tab (Neon calls this "SQL Editor" —
   whichever provider you attached, it can't run multiple statements
   pasted together at once, so run each numbered block separately):
   - **New database**: run every block in [`db/schema.sql`](./db/schema.sql)
     in order — creates all 9 tables (including `users` with its
     `password_hash` column, `section_access` for per-student section
     unlocking, and `access_requests` for the Notifications tab).
   - **Already ran an older version of this file against a live
     database?** Run, in order:
     1. [`db/migration_002_auth.sql`](./db/migration_002_auth.sql) —
        adds `users`/`login_tokens` and a `user_id` column on each
        existing table.
     2. [`db/migration_003_passwords.sql`](./db/migration_003_passwords.sql) —
        adds `users.password_hash` and drops the now-unused
        `login_tokens` table (magic-link login was replaced with
        email + password).
     3. [`db/migration_004_section_access.sql`](./db/migration_004_section_access.sql) —
        adds the `section_access` table. **All existing students will
        start fully locked out of every section** until the next
        migration backfills the defaults below (or you grant access
        manually from the Users tab).
     4. [`db/migration_005_default_access.sql`](./db/migration_005_default_access.sql) —
        grants Contact Info, Widening Access, and the Quiz to every
        **existing** student (new signups get these automatically going
        forward), and adds the `access_requests` table backing the
        Notifications tab. Local Induction and Feedback are left locked
        — grant them per student, or wait for a Request Access
        notification.
     None of these touch your existing submission data.

### 3. Add the Gmail App Password

1. On the `franzy840@gmail.com` Google account: turn on **2-Step
   Verification** if it isn't already (Google Account → Security).
2. Google Account → Security → **App Passwords** → create one (name it
   e.g. "Work Experience Forms") → copy the 16-character password.
3. In the Vercel project → **Settings → Environment Variables**, add:
   - `GMAIL_USER` = `franzy840@gmail.com`
   - `GMAIL_APP_PASSWORD` = the 16-character app password
   (Add to all environments: Production, Preview, Development.)

### 4. Add the login secrets

In the same **Settings → Environment Variables** screen, add two more
(all environments):

- `JWT_SECRET` = any long random string — this signs login session
  cookies for both students and admin. Generate one with
  `openssl rand -hex 32` (or any password generator), and keep it
  secret; anyone with it could forge a login session.
- `ADMIN_PASSWORD` = a password of your choosing for the admin
  dashboard. You'll log in at `/admin/login` with username `hansel`
  (see `ADMIN_USERNAME` in `shared/constants.ts`) + this password.

### 5. Deploy

Trigger a deploy (Vercel does this automatically on every push to the
branch/PR, or click **Deploy** in the dashboard). Once live, Vercel
gives you a public URL like `https://student-experience-app.vercel.app`.

- Link to give students: `https://<your-project>.vercel.app/signup` —
  they create their account there, then `/day1` and `/feedback` (once
  unlocked) are reachable from the home page while logged in.
- Your admin login: `https://<your-project>.vercel.app/admin/login`

You can also add a custom domain under **Settings → Domains** if you'd
rather hand out a nicer link.

## Local development

```bash
npm install
npm run dev          # frontend only, http://localhost:5173 (no /api)
```

To run the full stack locally (frontend + API + database), install the
[Vercel CLI](https://vercel.com/docs/cli), run `vercel link` once to
connect this folder to the Vercel project, then:

```bash
vercel env pull .env.local   # pulls POSTGRES_URL, GMAIL_*, JWT_SECRET, ADMIN_PASSWORD from Vercel
vercel dev
```

## Data access & privacy

- Only you (the Vercel project owner) can query the database, read the
  deployed function logs, or sign in to `/admin` — students only ever
  see the public login + forms.
- The admin dashboard (`/admin`) is a second, separate login (username
  `hansel` + `ADMIN_PASSWORD`) — it's not a student account with
  elevated permissions, so there's no risk of a student account
  accidentally gaining admin access.
- Only `franzy840@gmail.com` ever receives a notification email from
  this app — see `ADMIN_EMAIL` in `shared/constants.ts` if that ever
  needs to change. Students never receive any email from the app —
  login is email + password, and password resets happen entirely on
  the admin dashboard.
- Password resets are admin-only and require the admin to relay the new
  password to the student out of band (in person, chat, etc) — there's
  no self-service "forgot password" flow, by design, since email
  delivery to students was the whole problem this replaced.
- Widening Access answers have no identifiers beyond `student_name` and
  are optional per-question ("Prefer not to say" is always offered) —
  per the source NHS document, consider periodically clearing that
  table after each reporting period.
- Contact info and next-of-kin phone numbers are sensitive — don't add
  extra collaborators to the Vercel project or database without
  thinking about who needs access to that data.

## Section access control

Contact Info, Widening Access, and the Quiz are granted to every
student automatically at signup (`DEFAULT_GRANTED_SECTIONS` in
`shared/constants.ts`, applied in `api/auth.ts` `handleSignup`). Local
Induction and Final Day Feedback are held back — the admin must
explicitly grant each one per student from **Users → Manage access**
before the student can see/submit that section.

A student who hits a locked section (on the Day 1 hub or `/feedback`)
sees a **Request Access** button instead of just a locked message.
Requesting inserts a row into `access_requests`, which shows up for the
admin in the **Notifications** tab (name, email, section, when) with
**Grant access** / **Dismiss** actions. Granting access always resolves
any pending request for that section too, so the notification clears
itself the moment the admin acts on it.

This is enforced server-side (`api/day1.ts` and `api/feedback.ts` both
check the `section_access` table before accepting a submission,
independent of what the UI shows) as well as in the UI (locked sections
show "Not yet unlocked" instead of a form). Each section can only be
submitted once per student — resubmitting an already-completed section
is rejected.

The section keys and their human-readable labels live in
`SECTION_KEYS`/`SECTION_LABELS` in
[`shared/constants.ts`](./shared/constants.ts).

## Changing the questions

All form field/question text lives in one place:
[`shared/constants.ts`](./shared/constants.ts). It's imported by both
the React forms and the API validation/scoring logic, so editing a
label or option list there updates everywhere consistently. If you add
or rename a field, also update the matching column in
[`db/schema.sql`](./db/schema.sql) and the insert helper in
[`api/_lib/db.ts`](./api/_lib/db.ts).
