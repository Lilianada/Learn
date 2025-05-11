/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { dev, isServer }) => {
    // Force strict mode to be disabled to prevent double renders in development
    config.mode = dev && !isServer ? 'development' : config.mode;
    return config;
  },
  reactStrictMode: false,
}

export default nextConfig
