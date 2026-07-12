import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ADMIN_USERNAME } from '../shared/constants.js';
import { setSessionCookie, clearSessionCookie, getSession, hashPassword, verifyPassword, timingSafeEqual } from './_lib/auth.js';
import { createUser, findUserByEmail, hasCompletedDay1, hasCompletedFeedback } from './_lib/db.js';

// Consolidated: signup, login, admin-login, logout, and session lookup all
// live in one serverless function (Vercel's Hobby plan caps a deployment
// at 12 functions - one file per action would blow past that fast).

function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    await handleMe(req, res);
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body ?? {};
  switch (body.action) {
    case 'signup':
      await handleSignup(req, res);
      return;
    case 'login':
      await handleLogin(req, res);
      return;
    case 'admin-login':
      await handleAdminLogin(req, res);
      return;
    case 'logout':
      handleLogout(res);
      return;
    default:
      res.status(400).json({ error: 'Unknown action.' });
  }
}

async function handleMe(req: VercelRequest, res: VercelResponse) {
  const session = getSession(req);
  if (!session) {
    res.status(200).json({ user: null });
    return;
  }

  if (session.role === 'admin') {
    res.status(200).json({ user: { role: 'admin', username: session.username } });
    return;
  }

  const [day1Completed, feedbackCompleted] = await Promise.all([
    hasCompletedDay1(session.userId),
    hasCompletedFeedback(session.userId),
  ]);

  res.status(200).json({
    user: {
      role: 'student',
      id: session.userId,
      name: session.name,
      email: session.email,
      day1Completed,
      feedbackCompleted,
    },
  });
}

async function handleSignup(req: VercelRequest, res: VercelResponse) {
  const body = req.body ?? {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!name) {
    res.status(400).json({ error: 'Please enter your full name.' });
    return;
  }
  if (!isValidEmail(email)) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters.' });
    return;
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists. Please log in instead.' });
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser(name, email, passwordHash);

  setSessionCookie(res, { role: 'student', userId: user.id, name: user.name, email: user.email });
  res.status(200).json({ ok: true });
}

async function handleLogin(req: VercelRequest, res: VercelResponse) {
  const body = req.body ?? {};
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  const genericError = { error: 'Incorrect email or password.' };

  const user = await findUserByEmail(email);
  if (!user || !user.password_hash) {
    res.status(401).json(genericError);
    return;
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    res.status(401).json(genericError);
    return;
  }

  setSessionCookie(res, { role: 'student', userId: user.id, name: user.name, email: user.email });
  res.status(200).json({ ok: true });
}

async function handleAdminLogin(req: VercelRequest, res: VercelResponse) {
  const body = req.body ?? {};
  const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    res.status(500).json({ error: 'Admin login is not configured (ADMIN_PASSWORD is not set).' });
    return;
  }

  const usernameMatches = username.length > 0 && timingSafeEqual(username, ADMIN_USERNAME.toLowerCase());
  const passwordMatches = password.length > 0 && timingSafeEqual(password, adminPassword);

  if (!usernameMatches || !passwordMatches) {
    res.status(401).json({ error: 'Incorrect username or password.' });
    return;
  }

  setSessionCookie(res, { role: 'admin', username: ADMIN_USERNAME });
  res.status(200).json({ ok: true });
}

function handleLogout(res: VercelResponse) {
  clearSessionCookie(res);
  res.status(200).json({ ok: true });
}
