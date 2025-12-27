import { defineMiddleware } from 'astro:middleware';
import { verifyToken } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
    const { pathname } = context.url;

    // Protect /admin routes and /api routes (except auth)
    const needsAuth = pathname.startsWith('/admin') ||
        (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/'));

    if (!needsAuth) {
        return next();
    }

    // Get token from cookie
    const cookies = context.request.headers.get('cookie') || '';
    const tokenMatch = cookies.match(/auth_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) {
        if (pathname.startsWith('/api/')) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        return Response.redirect(`${import.meta.env.SITE_URL}/?error=not_logged_in`, 302);
    }

    // Verify token
    const user = await verifyToken(token);

    if (!user) {
        if (pathname.startsWith('/api/')) {
            return new Response(JSON.stringify({ error: 'Invalid token' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        return Response.redirect(`${import.meta.env.SITE_URL}/?error=invalid_token`, 302);
    }

    // Store user in locals for use in pages and API routes
    context.locals.user = user;

    return next();
});
