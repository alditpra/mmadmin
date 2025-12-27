import type { APIRoute } from 'astro';
import { getAllCars, addCar } from '../../../lib/sheets';

export const GET: APIRoute = async () => {
    try {
        const cars = await getAllCars();
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

export const POST: APIRoute = async ({ request }) => {
    try {
        const car = await request.json();
        await addCar(car);
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
