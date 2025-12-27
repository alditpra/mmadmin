import type { APIRoute } from 'astro';
import { getAllTestimonials, addTestimonial } from '../../../lib/sheets';

export const GET: APIRoute = async () => {
    try {
        const testimonials = await getAllTestimonials();
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

export const POST: APIRoute = async ({ request }) => {
    try {
        const testimonial = await request.json();
        await addTestimonial(testimonial);
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
