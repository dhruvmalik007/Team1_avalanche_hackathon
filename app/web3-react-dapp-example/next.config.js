/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  reactStrictMode: true,
  experimental: { externalDir: true },
  transpilePackages: ['@rlhub/api-types', '@rlhub/api-client', '@prb/foundry-template'],
  eslint: {
    // Do not block builds on ESLint errors in Next.js, per request
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
