import nodemailer from 'nodemailer';
import { ADMIN_EMAIL } from '../../shared/constants';
import { buildWorkbookBuffer } from './excel';

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
