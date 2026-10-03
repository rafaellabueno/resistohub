// @ts-check

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  output: 'standalone',

  i18n: {
    locales: ["en-us", "pt-br", "es-es"],
    defaultLocale: "en-us",
    localeDetection: false,
  },

  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.resistohub.com',
        pathname: '/trpc/static/**',
      },
    ],
  },
}

module.exports = config
