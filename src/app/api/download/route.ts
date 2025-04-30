import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client } from '@aws-sdk/client-s3';
import { env } from '@/env';
import type { NextRequest } from 'next/server';

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

// Get Pre-Signed URL for Download
export async function GET(request: NextRequest) {
  const storagePath = request.nextUrl.searchParams.get('storage_path') as string;
  try {
    const url = await getSignedUrl(
      S3,
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: storagePath,
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
