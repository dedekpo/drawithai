import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Configurações para compatibilidade com React 18/19
    esmExternals: true,
  },
};

export default nextConfig;
