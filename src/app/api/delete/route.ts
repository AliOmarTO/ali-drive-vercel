import { NextRequest, NextResponse } from 'next/server';
import {
  DeleteObjectsCommand,
  S3Client,
  S3ServiceException,
  waitUntilObjectNotExists,
} from '@aws-sdk/client-s3';
import { env } from '@/env';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
 * Delete multiple objects from an S3 bucket.
 * @param {{ keys: string[] }}
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keys }: { keys: string[] } = body;

    if (!Array.isArray(keys)) {
      return NextResponse.json({ error: 'Invalid input. Provide keys array.' }, { status: 400 });
    }

    const { Deleted } = await S3.send(
      new DeleteObjectsCommand({
        Bucket: BUCKET_NAME,
        Delete: {
          Objects: keys.map((k) => ({ Key: k })),
        },
      })
    );

    for (const key of keys) {
      await waitUntilObjectNotExists(
        { client: S3, maxWaitTime: 30 },
        { Bucket: BUCKET_NAME, Key: key }
      );
    }

    return NextResponse.json({
      message: `Successfully deleted ${Deleted?.length || 0} objects from S3 bucket.`,
      deletedObjects: Deleted?.map((d) => d.Key) || [],
    });
  } catch (error) {
    if (error instanceof S3ServiceException) {
      if (error.name === 'NoSuchBucket') {
        return NextResponse.json(
          {
            error: `The bucket "${error.$metadata?.httpHeaders['x-amz-bucket-name']}" doesn't exist.`,
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
