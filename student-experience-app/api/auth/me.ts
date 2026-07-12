import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from '../_lib/auth.js';
import { hasCompletedDay1, hasCompletedFeedback } from '../_lib/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
