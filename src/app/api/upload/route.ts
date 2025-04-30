import type { NextRequest } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client } from '@aws-sdk/client-s3';

import { env } from '@/env';
import { auth } from '@clerk/nextjs/server';
import { v4 } from 'uuid';


const ACCOUNT_ID = env.ACCOUNT_ID as string;
const ACCESS_KEY_ID = env.ACCESS_KEY_ID as string;
const SECRET_ACCESS_KEY = env.SECRET_ACCESS_KEY as string;
const BUCKET_NAME = env.BUCKET_NAME as string;

// max upload limit is 5mb
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

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
  const { filename, size, type }: { filename: string; size: number; type: string } =
    await request.json();
  const { userId } = await auth(); // Get Clerk userId

  // if over the upload limit dont create a presigned url
  if (size > MAX_SIZE_BYTES) {
    return new Response('File too large', { status: 413 });
  }

  // if not a image file dont create a presigned url
  if (!['image/png', 'image/jpeg', 'image/webp, image/avif'].includes(type)) {
    return new Response('Unsupported file type', { status: 400 });
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
  } catch (error: unknown) {
    if (error instanceof Error) {
      return Response.json({ error: error.message });
    }
    return Response.json({ error: 'An unknown error occurred' });
  }
}
