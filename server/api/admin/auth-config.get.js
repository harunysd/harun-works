import { maskEmail } from '../../utils/admin-auth.js';

export default defineEventHandler(() => {
  const adminEmail = process.env.ADMIN_EMAIL || 'harunysd@gmail.com';
  const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
  const hasMailer = Boolean(
    process.env.RESEND_API_KEY ||
      (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) ||
      (process.env.SMTP_USER && process.env.SMTP_PASS),
  );

  return {
    googleClientId,
    hasGoogleAuth: Boolean(googleClientId),
    adminEmail,
    maskedEmail: maskEmail(adminEmail),
    hasMailer,
  };
});
