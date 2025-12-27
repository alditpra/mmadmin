import type { APIRoute } from 'astro';
import { getSettings, updateSettings } from '../../lib/sheets';

export const GET: APIRoute = async () => {
    try {
        const settings = await getSettings();
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

export const PUT: APIRoute = async ({ request }) => {
    try {
        const settings = await request.json();
        await updateSettings(settings);
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
