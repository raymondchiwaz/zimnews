/** @type {import('next').NextConfig} */
const nextConfig = {
  // Export static HTML for Amplify static hosting
  output: 'export',
  images: {
    unoptimized: true,
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
  // Rewrites are ignored in static export; frontend calls API via NEXT_PUBLIC_API_URL directly
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