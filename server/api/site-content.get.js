import { readSiteContent } from '../utils/site-content.js';

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-store');
  return readSiteContent();
});
