const path = require("path");

/** @type {import("next").NextConfig} */
const nextConfig = {
  // Point output file tracing root to workspace root
  outputFileTracingRoot: path.resolve(__dirname, ".."),

  // Transpile Midnight packages for client-side use
  transpilePackages: [
    "@midnight-ntwrk/compact-runtime",
    "@midnight-ntwrk/ledger-v8",
    "@midnight-ntwrk/midnight-js-contracts",
    "@midnight-ntwrk/midnight-js-node-zk-config-provider",
    "@midnight-ntwrk/midnight-js-indexer-public-data-provider",
    "@midnight-ntwrk/midnight-js-network-id",
    "@midnight-ntwrk/midnight-js-types",
    "@midnight-ntwrk/midnight-js-utils",
    "@midnight-ntwrk/compact-js",
  ],

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        net: false,
        tls: false,
        child_process: false,
        http: false,
        https: false,
        stream: false,
        zlib: false,
      };
    }
    return config;
  },

  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
