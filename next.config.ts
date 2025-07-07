import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Configurações para compatibilidade com React 18/19
    esmExternals: true,
  },
  // Configuração para NextAuth.js
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
};

export default nextConfig;
