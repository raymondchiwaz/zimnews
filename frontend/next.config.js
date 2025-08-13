/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'herald.co.zw',
      'newsday.co.zw',
      'dailynews.co.zw',
      'chronicle.co.zw',
      'newzimbabwe.com',
      'thestandard.co.zw',
      'zimeye.net',
      'bulawayo24.com',
      'iharare.com',
      'nehandaradio.com',
      'localhost'
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async rewrites() {
    return [
      {
        source: '/api/articles',
        destination: 'http://article-service:8002/articles'
      },
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;