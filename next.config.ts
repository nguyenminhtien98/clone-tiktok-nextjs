import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, {isServer}) => {
    config.module.rules.push({test: /\.node$/, use: 'raw-loader'})
    if(!isServer) config.externals.push('canvas')
      return config
  }
};

module.exports = nextConfig;
