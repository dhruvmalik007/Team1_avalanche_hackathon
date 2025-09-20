/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  reactStrictMode: true,
  transpilePackages: ['@rlhub/api-types', '@rlhub/api-client'],
};

module.exports = nextConfig;
