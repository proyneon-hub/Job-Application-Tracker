import type { NextConfig } from "next";

/**
 * Basic security headers on every response. (A Content-Security-Policy is a
 * planned follow-up: the inline theme script in the root layout would need a
 * nonce or hash first.)
 */
const securityHeaders = [
  // Don't let browsers guess file types (stops some content-sniffing attacks).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Send only the origin, not the full URL, to other sites.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Nobody may show this app inside a frame (prevents clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // The app never needs these browser features.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
