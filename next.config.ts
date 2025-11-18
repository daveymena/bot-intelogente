import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Output standalone para Docker (reduce tamaño de imagen)
  output: 'standalone',
  
  typescript: {
    ignoreBuildErrors: true,
  },
  // 禁用 Next.js 热重载，由 nodemon 处理重编译
  reactStrictMode: false,
  allowedDevOrigins: ['127.0.0.1'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'megacomputer.com.co',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'dcdn-us.mitiendanube.com',
      },
      {
        protocol: 'https',
        hostname: '*.mitiendanube.com',
      },
      {
        protocol: 'https',
        hostname: 'http2.mlstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'exitocol.vtexassets.com',
      },
      {
        protocol: 'https',
        hostname: '*.vtexassets.com',
      },
      {
        protocol: 'https',
        hostname: '*.vteximg.com.br',
      },
    ],
    unoptimized: true,
  },
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Deshabilitar hot reload de webpack (nodemon lo maneja)
      config.watchOptions = {
        ignored: ['**/*'],
      };
    }

    // Configuración para whatsapp-web.js y módulos nativos
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'whatsapp-web.js': 'commonjs whatsapp-web.js',
        'bufferutil': 'commonjs bufferutil',
        'utf-8-validate': 'commonjs utf-8-validate',
      });
    }

    // Resolver módulos nativos para el navegador
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'fs': false,
      'net': false,
      'tls': false,
      'bufferutil': false,
      'utf-8-validate': false,
    };

    return config;
  },
  eslint: {
    // 构建时忽略ESLint错误
    ignoreDuringBuilds: true,
  },
  // Headers para Open Graph y caché de imágenes
  async headers() {
    return [
      {
        source: '/smart-sales-bot-logo.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
      {
        source: '/:path*.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
      {
        source: '/:path*.jpg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
