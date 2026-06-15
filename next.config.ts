import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 같은 네트워크의 기기(폰 등)에서 로컬 IP로 dev 서버 접속 허용
  // (와이파이 환경에 따라 본인 IP를 추가하세요: ipconfig getifaddr en0)
  allowedDevOrigins: ['192.168.45.184'],
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
