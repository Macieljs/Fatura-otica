import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const origin = process.env.IDENTITY_API_ORIGIN ?? (process.env.NODE_ENV === "development" ? "http://localhost:5000" : undefined);
    return origin ? [{ source: "/api/v1/identity/:path*", destination: `${origin.replace(/\/$/, "")}/api/v1/identity/:path*` }] : [];
  },
};

export default nextConfig;
