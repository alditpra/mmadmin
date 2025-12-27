import type { APIRoute } from 'astro';
import { getAllTestimonials, addTestimonial } from '../../../lib/sheets';

export const GET: APIRoute = async ({ locals }) => {
    try {
        const accessToken = locals.user?.accessToken;
        if (!accessToken) {
            return new Response(JSON.stringify({ error: 'Not authenticated' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const testimonials = await getAllTestimonials(accessToken);
        return new Response(JSON.stringify(testimonials), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch testimonials' }), {
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

        const testimonial = await request.json();
        await addTestimonial(accessToken, testimonial);
        return new Response(JSON.stringify({ success: true }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error adding testimonial:', error);
        return new Response(JSON.stringify({ error: 'Failed to add testimonial' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
