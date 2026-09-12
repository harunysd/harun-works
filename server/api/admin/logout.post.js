import { clearAdminSession } from '../../utils/admin-auth.js';

export default defineEventHandler((event) => {
  clearAdminSession(event);
  return { ok: true };
});
