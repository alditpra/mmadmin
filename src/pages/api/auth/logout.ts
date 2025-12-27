import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
    return new Response(null, {
        status: 302,
        headers: {
            'Location': `${import.meta.env.SITE_URL}/`,
            'Set-Cookie': `auth_token=; Path=/; HttpOnly; Max-Age=0`,
        },
    });
};

export const POST: APIRoute = async () => {
    return new Response(null, {
        status: 302,
        headers: {
            'Location': `${import.meta.env.SITE_URL}/`,
            'Set-Cookie': `auth_token=; Path=/; HttpOnly; Max-Age=0`,
        },
    });
};
