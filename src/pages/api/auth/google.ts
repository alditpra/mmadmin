import type { APIRoute } from 'astro';
import { getGoogleAuthUrl } from '../../../lib/auth';

export const GET: APIRoute = async () => {
    const authUrl = getGoogleAuthUrl();
    return Response.redirect(authUrl, 302);
};
