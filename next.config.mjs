/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

// Replicate __dirname behavior in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['@genkit-ai/*'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  webpack(config) {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
};

export default nextConfig;
