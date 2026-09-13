import {
  setAdminSession,
  isAllowedAdminEmail,
} from '../../../../utils/admin-auth.js';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const code = query.code;
  const error = query.error;

  if (error || !code) {
    return sendRedirect(
      event,
      `/admin?error=${encodeURIComponent(error || 'Google girişi iptal edildi.')}`,
      302,
    );
  }

  const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
  const reqUrl = getRequestURL(event);
  const host = reqUrl.host || 'harun.works';
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
  const protocol = isLocal ? 'http:' : 'https:';
  const callbackUrl = `${protocol}//${host}/api/admin/auth/google/callback`;

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.id_token) {
      console.error('Google token exchange error:', tokenData);
      const errDetail =
        tokenData.error_description ||
        tokenData.error ||
        'Google doğrulama belirteci alınamadı.';
      return sendRedirect(
        event,
        `/admin?error=${encodeURIComponent(errDetail)}`,
        302,
      );
    }

    const infoRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(tokenData.id_token)}`,
    );
    const userInfo = await infoRes.json();

    const email = (userInfo.email || '').trim().toLowerCase();
    if (!isAllowedAdminEmail(email)) {
      return sendRedirect(
        event,
        `/admin?error=${encodeURIComponent(`Bu Google hesabı (${email}) yetkili değil. Yalnızca harunysd@gmail.com ile giriş yapılabilir.`)}`,
        302,
      );
    }

    setAdminSession(event);
    return sendRedirect(event, '/admin', 302);
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return sendRedirect(
      event,
      `/admin?error=${encodeURIComponent('Google ile giriş sırasında bir hata oluştu.')}`,
      302,
    );
  }
});
