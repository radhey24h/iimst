/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: { 
    unoptimized: true,
    remotePatterns: [{ protocol: 'https', hostname: 'picsum.photos', pathname: '/**' }] 
  },
};
module.exports = nextConfig;
