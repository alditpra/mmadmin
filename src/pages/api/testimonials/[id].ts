import type { APIRoute } from 'astro';
import { updateTestimonial, deleteTestimonial } from '../../../lib/sheets';

export const PUT: APIRoute = async ({ params, request }) => {
    try {
        const testimonial = await request.json();
        const success = await updateTestimonial(params.id!, testimonial);
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

export const DELETE: APIRoute = async ({ params }) => {
    try {
        const success = await deleteTestimonial(params.id!);
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
