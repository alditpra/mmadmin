import type { APIRoute } from 'astro';
import { updateTestimonial, deleteTestimonial } from '../../../lib/sheets';

export const PUT: APIRoute = async ({ params, request, locals }) => {
    try {
        const accessToken = locals.user?.accessToken;
        if (!accessToken) {
            return new Response(JSON.stringify({ error: 'Not authenticated' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const testimonial = await request.json();
        const success = await updateTestimonial(accessToken, params.id!, testimonial);
        if (!success) {
            return new Response(JSON.stringify({ error: 'Testimonial not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error updating testimonial:', error);
        return new Response(JSON.stringify({ error: 'Failed to update testimonial' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
    try {
        const accessToken = locals.user?.accessToken;
        if (!accessToken) {
            return new Response(JSON.stringify({ error: 'Not authenticated' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const success = await deleteTestimonial(accessToken, params.id!);
        if (!success) {
            return new Response(JSON.stringify({ error: 'Testimonial not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error deleting testimonial:', error);
        return new Response(JSON.stringify({ error: 'Failed to delete testimonial' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
