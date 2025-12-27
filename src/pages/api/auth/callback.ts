import type { APIRoute } from 'astro';
import { getGoogleTokens, getGoogleUserInfo, isEmailAllowed, createToken } from '../../../lib/auth';

export const GET: APIRoute = async ({ url }) => {
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error || !code) {
        return Response.redirect(`${import.meta.env.SITE_URL}/?error=auth_failed`, 302);
    }

    try {
        // Exchange code for tokens
        const tokens = await getGoogleTokens(code);

        if (!tokens.access_token) {
            return Response.redirect(`${import.meta.env.SITE_URL}/?error=token_failed`, 302);
        }

        // Get user info
        const userInfo = await getGoogleUserInfo(tokens.access_token);

        // Check if email is in whitelist
        if (!isEmailAllowed(userInfo.email)) {
            return Response.redirect(`${import.meta.env.SITE_URL}/?error=not_authorized`, 302);
        }

        // Create JWT token with access token for Sheets API
        const token = await createToken({
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
        });

        // Create new response with cookie
        return new Response(null, {
            status: 302,
            headers: {
                'Location': `${import.meta.env.SITE_URL}/admin`,
                'Set-Cookie': `auth_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24}${import.meta.env.PROD ? '; Secure' : ''}`,
            },
        });
    } catch (err) {
        console.error('OAuth callback error:', err);
        return Response.redirect(`${import.meta.env.SITE_URL}/?error=callback_failed`, 302);
    }
};
