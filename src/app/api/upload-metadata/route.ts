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

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Store the metadata in Supabase after successful upload
    const supabase = createSupabaseClient();
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
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
