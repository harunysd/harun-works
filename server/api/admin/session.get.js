import { isAdmin } from '../../utils/admin-auth.js';

export default defineEventHandler((event) => ({
  authenticated: isAdmin(event),
}));
