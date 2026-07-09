# Student Work Experience Forms App

A public web app for collecting Work Experience student paperwork:

- **`/day1`** — one combined public link covering Contact Info, the
  Widening Access Participation Survey, Local Induction sign-off, and
  the safety Induction Quiz (auto-graded). Submitted together as one
  flow, but stored in **separate database tables / Excel tabs** per
  topic.
- **`/feedback`** — a separate public link for the Final Day Work
  Experience Feedback form.

Every submission is written to a Postgres database and triggers an
email to the admin **only** (`franzy840@gmail.com`, see
`shared/constants.ts`) with the full dataset attached as a real
`.xlsx` workbook (one sheet per topic). If a student flags a
safeguarding concern on the feedback form, an additional urgent email
fires immediately.

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
2. Open the database's **Query** tab (or connect via `psql` using the
   connection string from **Storage → .env.local tab**) and run the
   contents of [`db/schema.sql`](./db/schema.sql) once, to create the
   five tables.

### 3. Add the Gmail App Password

1. On the `franzy840@gmail.com` Google account: turn on **2-Step
   Verification** if it isn't already (Google Account → Security).
2. Google Account → Security → **App Passwords** → create one (name it
   e.g. "Work Experience Forms") → copy the 16-character password.
3. In the Vercel project → **Settings → Environment Variables**, add:
   - `GMAIL_USER` = `franzy840@gmail.com`
   - `GMAIL_APP_PASSWORD` = the 16-character app password
   (Add to all environments: Production, Preview, Development.)

### 4. Deploy

Trigger a deploy (Vercel does this automatically on every push to the
branch/PR, or click **Deploy** in the dashboard). Once live, Vercel
gives you a public URL like `https://student-experience-app.vercel.app`.

- Day 1 link to give students: `https://<your-project>.vercel.app/day1`
- Final Day link: `https://<your-project>.vercel.app/feedback`

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
vercel env pull .env.local   # pulls POSTGRES_URL, GMAIL_* from Vercel
vercel dev
```

## Data access & privacy

- Only you (the Vercel project owner) can query the database or read
  the deployed function logs — students only ever see the public forms.
- Only `franzy840@gmail.com` ever receives an email from this app —
  see `ADMIN_EMAIL` in `shared/constants.ts` if that ever needs to
  change.
- Widening Access answers have no identifiers beyond `student_name` and
  are optional per-question ("Prefer not to say" is always offered) —
  per the source NHS document, consider periodically clearing that
  table after each reporting period.
- Contact info and next-of-kin phone numbers are sensitive — don't add
  extra collaborators to the Vercel project or database without
  thinking about who needs access to that data.

## Changing the questions

All form field/question text lives in one place:
[`shared/constants.ts`](./shared/constants.ts). It's imported by both
the React forms and the API validation/scoring logic, so editing a
label or option list there updates everywhere consistently. If you add
or rename a field, also update the matching column in
[`db/schema.sql`](./db/schema.sql) and the insert helper in
[`api/_lib/db.ts`](./api/_lib/db.ts).
