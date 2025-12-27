import type { APIRoute } from 'astro';
import { getCarById, updateCar, deleteCar } from '../../../lib/sheets';

export const GET: APIRoute = async ({ params }) => {
    try {
        const car = await getCarById(params.id!);
        if (!car) {
            return new Response(JSON.stringify({ error: 'Car not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        return new Response(JSON.stringify(car), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching car:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch car' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

export const PUT: APIRoute = async ({ params, request }) => {
    try {
        const car = await request.json();
        const success = await updateCar(params.id!, car);
        if (!success) {
            return new Response(JSON.stringify({ error: 'Car not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error updating car:', error);
        return new Response(JSON.stringify({ error: 'Failed to update car' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

export const DELETE: APIRoute = async ({ params }) => {
    try {
        const success = await deleteCar(params.id!);
        if (!success) {
            return new Response(JSON.stringify({ error: 'Car not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error deleting car:', error);
        return new Response(JSON.stringify({ error: 'Failed to delete car' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
