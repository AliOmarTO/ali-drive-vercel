import { NextRequest, NextResponse } from 'next/server';
import {
  DeleteObjectsCommand,
  S3Client,
  S3ServiceException,
  waitUntilObjectNotExists,
} from '@aws-sdk/client-s3';
import { env } from '@/env';
import { Image } from '@/models/Image';
import { createSupabaseClient } from '../../../../utils/supabase/client';
import { auth } from '@clerk/nextjs/server';

const ACCOUNT_ID = env.ACCOUNT_ID as string;
const ACCESS_KEY_ID = env.ACCESS_KEY_ID as string;
const SECRET_ACCESS_KEY = env.SECRET_ACCESS_KEY as string;
const BUCKET_NAME = env.BUCKET_NAME as string;

// initialize S3 client
const S3 = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

/**
 * Delete multiple images
 * @param {{ images: Image[] }}
 */
export async function POST(request: NextRequest) {
  try {
    // Check if the request is authenticated/authorized for current user
    const { userId } = await auth(); // Get Clerk userId
    const supabase = createSupabaseClient();

    const body = await request.json();
    const { images }: { images: Image[] } = body;
    const S3keysToDelete = images.flatMap((img) => [img.thumbnail_path, img.storage_path]);
    const idsToDelete = images.map((img) => img.id);

    if (!Array.isArray(images)) {
      return NextResponse.json({ error: 'Invalid input. Provide images array.' }, { status: 400 });
    }

    // delete records from database
    const response = await supabase
      .from('images')
      .delete()
      .in('id', idsToDelete)
      .eq('user_id', userId); // ensure only current user's images

    if (response.error) {
      console.error('Supabase error:', response.error.message);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const { Deleted } = await S3.send(
      new DeleteObjectsCommand({
        Bucket: BUCKET_NAME,
        Delete: {
          Objects: S3keysToDelete.map((k) => ({ Key: k })),
        },
      })
    );

    for (const key of S3keysToDelete) {
      await waitUntilObjectNotExists(
        { client: S3, maxWaitTime: 30 },
        { Bucket: BUCKET_NAME, Key: key }
      );
    }

    return NextResponse.json({
      message: `Successfully deleted ${Deleted?.length || 0} objects from S3 bucket and status code ${response.status} from the Supabase database.`,
      deletedObjects: Deleted?.map((d) => d.Key) || [],
    });
  } catch (error) {
    if (error instanceof S3ServiceException) {
      if (error.name === 'NoSuchBucket') {
        return NextResponse.json(
          {
            error: `The bucket doesn't exist.`,
          },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: `${error.name}: ${error.message}` }, { status: 500 });
    }

    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
