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
    domains: ['lh3.googleusercontent.com'],
  },
  webpack: (config, { dev, isServer }) => {
    // Force strict mode to be disabled to prevent double renders in development
    config.mode = dev && !isServer ? 'development' : config.mode;
    
    // Add support for Firebase webworker usage
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        perf_hooks: false,
        async_hooks: false,
      };
    }
    
    return config;
  },
  reactStrictMode: false,
}

export default nextConfig
