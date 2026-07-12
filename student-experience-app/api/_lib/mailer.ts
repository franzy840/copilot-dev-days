import nodemailer from 'nodemailer';
import { ADMIN_EMAIL } from '../../shared/constants.js';
import { buildWorkbookBuffer } from './excel.js';

function getTransport() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error('GMAIL_USER / GMAIL_APP_PASSWORD environment variables are not set.');
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

/**
 * Emails the admin (and only the admin) a notification with the full
 * workbook attached as a real .xlsx export of every table.
 */
export async function sendAdminNotification(subject: string, bodyText: string) {
  const transport = getTransport();
  const buffer = await buildWorkbookBuffer();

  await transport.sendMail({
    from: process.env.GMAIL_USER,
    to: ADMIN_EMAIL,
    subject,
    text: bodyText,
    attachments: [
      {
        filename: 'work-experience-records.xlsx',
        content: buffer,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    ],
  });
}

/** Sends a one-time login link to a student's own email address. */
export async function sendMagicLinkEmail(to: string, link: string) {
  const transport = getTransport();
  await transport.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject: 'Your Work Experience login link',
    text: `Click this link to log in (expires in 15 minutes):\n\n${link}\n\nIf you didn't request this, you can ignore this email.`,
    html: `
      <p>Click the button below to log in (expires in 15 minutes):</p>
      <p><a href="${link}" style="display:inline-block;background:#0d5eae;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:700;">Log in</a></p>
      <p style="color:#666;font-size:0.85rem;">If you didn't request this, you can ignore this email.</p>
    `,
  });
}

/** Urgent alert with no attachment needed — used for safeguarding concerns. */
export async function sendUrgentAlert(subject: string, bodyText: string) {
  const transport = getTransport();
  await transport.sendMail({
    from: process.env.GMAIL_USER,
    to: ADMIN_EMAIL,
    subject,
    text: bodyText,
  });
}
