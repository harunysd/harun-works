export default defineEventHandler((event) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return sendRedirect(
      event,
      '/admin?error=GOOGLE_CLIENT_ID%20tan%C4%B1mlanmam%C4%B1%C5%9F',
      302,
    );
  }

  const reqUrl = getRequestURL(event);
  const callbackUrl = `${reqUrl.protocol}//${reqUrl.host}/api/admin/auth/google/callback`;

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId.trim());
  authUrl.searchParams.set('redirect_uri', callbackUrl);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('prompt', 'select_account');

  return sendRedirect(event, authUrl.toString(), 302);
});
