import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fdbwzblzvnpfcqexqyqi.supabase.co',
      },
    ],
  },
};

export default nextConfig;
