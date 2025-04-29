import type { NextRequest } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client } from '@aws-sdk/client-s3';
import { env } from '@/env';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseClient } from '../../../../utils/supabase/client';

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

// Get Pre-Signed URL for Upload
export async function POST(request: NextRequest) {
  const { filename }: { filename: string } = await request.json();
  const { userId } = await auth(); // Get Clerk userId

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const prefixedFilename = `${userId}/${filename}`;

  console.log('Generating pre-signed URL for:', prefixedFilename);

  try {
    const url = await getSignedUrl(
      S3,
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: prefixedFilename,
      }),
      {
        expiresIn: 600,
      }
    );
    return Response.json({ url });
  } catch (error: any) {
    return Response.json({ error: error.message });
  }
}
