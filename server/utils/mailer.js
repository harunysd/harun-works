import nodemailer from 'nodemailer';

export async function sendAdminRecoveryEmail({ to, code, link }) {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; background-color: #030303; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .container { max-width: 560px; margin: 30px auto; padding: 36px 30px; background-color: #0e0e0e; border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; color: #f7f7f7; }
    .brand { font-size: 11px; letter-spacing: 0.16em; color: #ffe6ed; text-transform: uppercase; font-weight: 700; margin-bottom: 8px; }
    .title { font-size: 22px; font-weight: 600; margin: 0 0 18px 0; color: #ffffff; letter-spacing: -0.02em; }
    .desc { font-size: 15px; line-height: 1.6; color: #a3a3a3; margin-bottom: 24px; }
    .code-box { background-color: #161616; border: 1px solid rgba(255,255,255,0.14); border-radius: 12px; padding: 22px; text-align: center; margin-bottom: 26px; }
    .code-label { font-size: 11px; color: #888888; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 8px; font-weight: 600; }
    .code { font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #ffe6ed; font-family: 'SFMono-Regular', Consolas, Menlo, monospace; }
    .code-expiry { font-size: 12px; color: #888888; margin-top: 10px; }
    .action-btn { display: inline-block; background-color: #ffe6ed; color: #030303 !important; font-weight: 600; font-size: 14px; padding: 14px 28px; border-radius: 8px; text-decoration: none; margin: 0 auto 24px auto; text-align: center; }
    .footer { border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; font-size: 12px; color: #666666; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="brand">HARUN WORKS / YÖNETİM</div>
    <h2 class="title">Giriş ve Şifre Kurtarma</h2>
    <p class="desc">
      Yönetim panelinize erişmek için bir giriş talebi oluşturuldu. Aşağıdaki 6 haneli tek kullanımlık doğrulama kodunu kullanarak veya doğrudan giriş butonuna tıklayarak panele giriş yapabilirsiniz.
    </p>

    <div class="code-box">
      <div class="code-label">Tek Kullanımlık Giriş Kodu</div>
      <div class="code">${code}</div>
      <div class="code-expiry">Bu kod 15 dakika süreyle geçerlidir.</div>
    </div>

    ${
      link
        ? `
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${link}" class="action-btn">Tek Tıkla Giriş Yap →</a>
    </div>
    `
        : ''
    }

    <div class="footer">
      Bu işlemi siz yapmadıysanız bu e-postayı güvenle silebilirsiniz. Panelinize sizden başka kimse erişemez.
    </div>
  </div>
</body>
</html>
  `;

  // 1. Resend REST API (Zero-dependency, optimal on Vercel Serverless)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const fromEmail =
        process.env.RESEND_FROM || 'HARUN WORKS <onboarding@resend.dev>';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject: `Yönetim Giriş Kodu: ${code}`,
          html: htmlContent,
        }),
      });

      if (res.ok) {
        return { success: true, provider: 'resend' };
      }
      const errText = await res.text();
      console.error('Resend API error:', errText);
    } catch (err) {
      console.error('Resend exception:', err);
    }
  }

  // 2. Gmail SMTP / Nodemailer fallback
  const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;
  if (gmailUser && gmailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });

      await transporter.sendMail({
        from: `"HARUN WORKS" <${gmailUser}>`,
        to,
        subject: `Yönetim Giriş Kodu: ${code}`,
        html: htmlContent,
      });

      return { success: true, provider: 'gmail-smtp' };
    } catch (err) {
      console.error('Nodemailer exception:', err);
    }
  }

  // 3. Inform caller that no mailer service is configured in env vars yet
  return {
    success: false,
    reason: 'no_mailer_configured',
    code,
  };
}
