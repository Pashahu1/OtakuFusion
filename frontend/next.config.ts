// next.config.js
module.exports = {
  reactStrictMode: true,
  allowedDevOrigins: [
    "http://localhost:3000",
    "https://otaku-fusion.vercel.app",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.example.com",
        pathname: "/account123/**",
      },
      {
        protocol: "https",
        hostname: "cdn.noitatnemucod.net",
        pathname: "/**",
      },
    ],
    experimental: {
      missingSuspenseWithCSRBailout: false,
    },
  },
};
