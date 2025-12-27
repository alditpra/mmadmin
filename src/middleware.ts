import { defineMiddleware } from 'astro:middleware';
import { verifyToken } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
    const { pathname } = context.url;

    // Only protect /admin routes
    if (!pathname.startsWith('/admin')) {
        return next();
    }

    // Get token from cookie
    const cookies = context.request.headers.get('cookie') || '';
    const tokenMatch = cookies.match(/auth_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) {
        return Response.redirect(`${import.meta.env.SITE_URL}/?error=not_logged_in`, 302);
    }

    // Verify token
    const user = await verifyToken(token);

    if (!user) {
        return Response.redirect(`${import.meta.env.SITE_URL}/?error=invalid_token`, 302);
    }

    // Store user in locals for use in pages
    context.locals.user = user;

    return next();
});
