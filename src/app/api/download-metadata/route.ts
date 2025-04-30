import { NextRequest, NextResponse } from 'next/server';
// import S3 from "@/lib/r2";

import { S3Client } from '@aws-sdk/client-s3';
import { env } from '@/env';
import { createSupabaseClient } from '../../../../utils/supabase/client';
import { auth } from '@clerk/nextjs/server';

const ACCOUNT_ID = env.ACCOUNT_ID as string;
const ACCESS_KEY_ID = env.ACCESS_KEY_ID as string;
const SECRET_ACCESS_KEY = env.SECRET_ACCESS_KEY as string;
const BUCKET_NAME = env.BUCKET_NAME as string;

const S3 = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

// Get metadata for the images
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth(); // Get Clerk userId
    const supabase = createSupabaseClient();

    // Pagination params
    const page = request.nextUrl.searchParams.get('page') || '1'; // Default to page 1 if not provided
    const pageSize = 10; // Number of images per page
    const offset = (Number(page) - 1) * pageSize;

    // Fetch image records for the current user with pagination
    const {
      data: images,
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
