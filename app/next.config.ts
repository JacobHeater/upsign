import type { NextConfig } from 'next';

const isCodespace = process.env.CODESPACE_NAME;
const apiUrl = isCodespace
  ? `https://${process.env.CODESPACE_NAME}-3002.app.github.dev`
  : 'http://localhost:3002';

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: apiUrl,
  },
};

export default nextConfig;
