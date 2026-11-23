import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      { source: '/integritet', destination: '/privacy', permanent: true },
      { source: '/integritet/', destination: '/privacy', permanent: true },
      { source: '/villkor', destination: '/terms', permanent: true },
      { source: '/villkor/', destination: '/terms', permanent: true },
    ];
  },
};

export default nextConfig;
