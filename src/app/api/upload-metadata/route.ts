import { createSupabaseClient } from '../../../../utils/supabase/client';
import type { NextRequest } from 'next/server';

// POST /api/uploadMetadata.ts

export async function POST(request: NextRequest) {
  const {
    filename,
    size,
    type,
    userId,
    storagePath,
  }: { filename: string; size: number; type: string; userId: string; storagePath: string } =
    await request.json();

  try {
    // Store the metadata in Supabase after successful upload
    const supabase = createSupabaseClient();

    // Check if the file already exists for the user
    // Check if the filename already exists in the system for the given user
    const { data: existingImage } = await supabase
      .from('images')
      .select('id') // Only need the id to check if it exists
      .eq('filename', filename)
      .eq('user_id', userId) // Make sure the filename belongs to the current user
      .single(); // Ensures we only get a single result if found

    console.log('existingImage:', existingImage);

    // If image already exists, skip the insert and return a message
    if (existingImage) {
      return new Response('Image already exists', { status: 409 }); // 409 Conflict
    }

    const { data, error } = await supabase.from('images').insert([
      {
        user_id: userId,
        filename,
        size,
        mime_type: type,
        storage_path: storagePath,
      },
    ]);

    if (error) {
      console.error('Supabase insert error:', error.message);
      return new Response('Database error: ' + error.message, { status: 500 });
    }

    console.log('uplaoded Data:', data);

    return new Response(JSON.stringify({ message: 'Metadata stored successfully' }), {
      status: 200,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred' }), { status: 500 });
  }
}
