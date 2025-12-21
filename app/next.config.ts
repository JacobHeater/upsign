import type { NextConfig } from 'next';
import path from 'path';

const isCodespace = process.env.CODESPACE_NAME;
const apiUrl = isCodespace
  ? `https://${process.env.CODESPACE_NAME}-3002.app.github.dev`
  : 'http://localhost:3002';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['common'],
  allowedDevOrigins: ['localhost', '127.0.0.1', '192.168.86.27', '192.168.86.228'],
  turbopack: {
    root: path.join(__dirname, '..'),
  },

  devIndicators: false,
  env: {
    NEXT_PUBLIC_API_URL: apiUrl,
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
};

export default nextConfig;
