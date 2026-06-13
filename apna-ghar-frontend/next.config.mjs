/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Browser loads remote images directly instead of going through Next's
    // server-side optimizer (which can't fetch over HTTPS behind Avast's
    // SSL scanning). Fine for a prototype hotlinking Unsplash.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
