const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    // All API responses are user-scoped or dynamic — never serve them from a
    // shared service-worker cache (cross-user data leak on shared browsers).
    {
      urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
      handler: 'NetworkOnly',
    },
    // Authenticated app documents must not be cached either.
    {
      urlPattern: ({ request, url }) =>
        request.destination === 'document' &&
        (url.pathname.startsWith('/app') || url.pathname.startsWith('/dashboard')),
      handler: 'NetworkOnly',
    },
    // Public marketing/document pages are safe to cache with a network-first fallback.
    {
      urlPattern: ({ request }) => request.destination === 'document',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        networkTimeoutSeconds: 10,
      },
    },
    {
      urlPattern: ({ request }) =>
        request.destination === 'script' ||
        request.destination === 'style' ||
        request.destination === 'font' ||
        request.destination === 'image',
      handler: 'CacheFirst',
      options: {
        cacheName: 'assets',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
      },
    },
  ],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
  serverExternalPackages: ['pdf-parse', 'pdfjs-dist', '@napi-rs/canvas', 'mammoth'],
  // Performance: compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Performance: image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 3600,
  },
  // Performance: bundle optimization
  experimental: {
    // Do not optimize `next-auth` — Turbopack can drop the [...nextauth] API route.
    optimizePackageImports: ['lucide-react'],
  },
  // Performance: compression
  compress: true,
  // Security + caching headers
  async headers() {
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(self), geolocation=(), payment=(), usb=()',
      },
    ]
    if (process.env.NODE_ENV === 'production') {
      securityHeaders.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains',
      })
    }
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        // API responses carry user data — keep them out of browser/proxy caches.
        source: '/api/(.*)',
        headers: [{ key: 'Cache-Control', value: 'private, no-store' }],
      },
      {
        source: '/(.*)\\.(woff2|woff|ttf)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },
}

module.exports = withPWA(nextConfig)
