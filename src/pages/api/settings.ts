import type { APIRoute } from 'astro';
import { getSettings, updateSettings } from '../../lib/sheets';

export const GET: APIRoute = async ({ locals }) => {
    try {
        const accessToken = locals.user?.accessToken;
        if (!accessToken) {
            return new Response(JSON.stringify({ error: 'Not authenticated' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const settings = await getSettings(accessToken);
        return new Response(JSON.stringify(settings), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch settings' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

export const PUT: APIRoute = async ({ request, locals }) => {
    try {
        const accessToken = locals.user?.accessToken;
        if (!accessToken) {
            return new Response(JSON.stringify({ error: 'Not authenticated' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const settings = await request.json();
        await updateSettings(accessToken, settings);
        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        return new Response(JSON.stringify({ error: 'Failed to update settings' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
