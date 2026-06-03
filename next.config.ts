import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    // Désactive la vérification TS pendant le build (pour isoler le problème)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Désactive la vérification ESLint pendant le build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Optimisation pour les environnements serveurs
  output: 'standalone', 
};


export default nextConfig;
