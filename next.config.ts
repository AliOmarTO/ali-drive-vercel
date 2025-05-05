import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ali-drive.60dc15121b1f861791766dc1d329ed9f.r2.cloudflarestorage.com',
        pathname: '/**', // this covers any path under that domain
      },
    ],
  },
};

export default nextConfig;
