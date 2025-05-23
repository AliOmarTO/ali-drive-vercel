import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '../../../../utils/supabase/client';
import { auth } from '@clerk/nextjs/server';

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short', // 'Jan', 'Feb', etc.
    day: 'numeric',
    year: 'numeric',
  });
}

// Get metadata for the images
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth(); // Get Clerk userId
    const supabase = createSupabaseClient();

    // Pagination params
    const page = request.nextUrl.searchParams.get('page') || '1'; // Default to page 1 if not provided
    const pageSize = 10; // Number of images per page
    const offset = (Number(page) - 1) * pageSize;

    console.log('User ID:', userId);
    // Fetch image records for the current user with pagination
    const {
      data: imagesRaw,
      error,
      count,
    } = await supabase
      .from('images')
      .select('*', { count: 'exact' })
      .eq('user_id', userId) // only current user images
      .range(offset, offset + pageSize - 1) // Pagination range
      .order('created_at', { ascending: false }); // order by created_at descending

    if (error) {
      console.error('Supabase error:', error.message);
      return new Response('Database error', { status: 500 });
    }

    // Map and format the dates
    const images = imagesRaw.map((image) => ({
      ...image,
      created_at: formatDate(image.created_at),
    }));

    // Calculate total pages
    const totalPages = count ? Math.ceil(count / pageSize) : 0;

    // Return the paginated data and pagination info
    return NextResponse.json({ images, totalPages, currentPage: Number(page) });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error generating pre-signed URLs:', error);
      return new Response('Error generating pre-signed URLs: ' + error, { status: 500 });
    }
    return Response.json({ error: 'An unknown error occurred' });
  }
}
