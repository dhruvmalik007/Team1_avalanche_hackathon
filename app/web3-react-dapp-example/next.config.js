/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  reactStrictMode: true,
  experimental: { externalDir: true },
  transpilePackages: ['@rlhub/api-types', '@rlhub/api-client', '@prb/foundry-template'],
};

module.exports = nextConfig;
