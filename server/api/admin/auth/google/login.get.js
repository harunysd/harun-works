export default defineEventHandler((event) => {
  const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
  if (!clientId) {
    return sendRedirect(
      event,
      '/admin?error=GOOGLE_CLIENT_ID%20tan%C4%B1mlanmam%C4%B1%C5%9F',
      302,
    );
  }

  const reqUrl = getRequestURL(event);
  const host = reqUrl.host || 'harun.works';
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
  const protocol = isLocal ? 'http:' : 'https:';
  const callbackUrl = `${protocol}//${host}/api/admin/auth/google/callback`;

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', callbackUrl);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('prompt', 'select_account');

  return sendRedirect(event, authUrl.toString(), 302);
});
