import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  // models and textures keep their names when they change (a Meshy file replacing a stand-in), so they are cached for a
  // day and revalidated in the background rather than marked immutable
  async headers() {
    const cache = [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }];
    return [
      { source: '/models/:path*', headers: cache },
      { source: '/textures/:path*', headers: cache },
    ];
  },
};

export default nextConfig;
