import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    CF_ACCOUNT_ID: z.string().optional(),
    CF_USER_API_TOKEN: z.string().optional(),
    DB_REMOTE_DATABASE_ID: z.string().optional(),
    DB_LOCAL_PATH: z.string().optional(),
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    CLERK_SECRET_KEY: z.string(),
    API_TOKEN: z.string().min(1, 'API_TOKEN is required'),
    ACCESS_KEY_ID: z.string().min(1, 'ACCESS_KEY_ID is required'),
    SECRET_ACCESS_KEY: z.string().min(1, 'SECRET_ACCESS_KEY is required'),
    S3_ENDPOINT: z.string().url('S3_ENDPOINT must be a valid URL'),
    ACCOUNT_ID: z.string().min(1, 'ACCOUNT_ID is required'),
    BUCKET_NAME: z.string().min(1, 'BUCKET_NAME is required'),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    CF_ACCOUNT_ID: process.env.CF_ACCOUNT_ID,
    CF_USER_API_TOKEN: process.env.CF_USER_API_TOKEN,
    DB_REMOTE_DATABASE_ID: process.env.DB_REMOTE_DATABASE_ID,
    DB_LOCAL_PATH: process.env.DB_LOCAL_PATH,
    NODE_ENV: process.env.NODE_ENV,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    ACCOUNT_ID: process.env.ACCOUNT_ID,
    ACCESS_KEY_ID: process.env.ACCESS_KEY_ID,
    SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY,
    BUCKET_NAME: process.env.BUCKET_NAME,
    API_TOKEN: process.env.API_TOKEN,
    S3_ENDPOINT: process.env.S3_ENDPOINT,
    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined.
   * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
