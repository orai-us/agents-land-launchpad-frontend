/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ipfs.io",
        port: "",
      },
      {
        protocol: "https",
        hostname: "storage.distilled.ai",
        port: "",
      },
    ],
  },

  // images: {
  //   disableStaticImages: true,
  //   domains: [
  //     's2.coinmarketcap.com',
  //   ],
  //   deviceSizes: [375, 720, 1080],
  //   imageSizes: [300, 600, 900],
  // },
};

export default nextConfig;
