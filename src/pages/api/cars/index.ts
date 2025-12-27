import type { APIRoute } from 'astro';
import { getAllCars, addCar } from '../../../lib/sheets';

export const GET: APIRoute = async ({ locals }) => {
    try {
        const accessToken = locals.user?.accessToken;
        if (!accessToken) {
            return new Response(JSON.stringify({ error: 'Not authenticated' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const cars = await getAllCars(accessToken);
        return new Response(JSON.stringify(cars), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching cars:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch cars' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const accessToken = locals.user?.accessToken;
        if (!accessToken) {
            return new Response(JSON.stringify({ error: 'Not authenticated' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const car = await request.json();
        await addCar(accessToken, car);
        return new Response(JSON.stringify({ success: true }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error adding car:', error);
        return new Response(JSON.stringify({ error: 'Failed to add car' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
