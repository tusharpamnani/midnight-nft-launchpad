/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable strict mode to prevent double effects
  typescript: {
    ignoreBuildErrors: true, // Ignore TypeScript errors for now
  },
  transpilePackages: [
    '@midnight-ntwrk/midnight-js-contracts',
    '@midnight-ntwrk/midnight-js-types',
    '@midnight-ntwrk/compact-runtime',
    '@midnight-ntwrk/ledger-v8',
    '@midnight-ntwrk/midnight-js-fetch-zk-config-provider',
    '@midnight-ntwrk/midnight-js-http-client-proof-provider',
    '@midnight-ntwrk/midnight-js-level-private-state-provider',
    '@midnight-ntwrk/midnight-js-network-id',
    '@midnight-ntwrk/midnight-js-node-zk-config-provider',
    '@midnight-ntwrk/midnight-js-utils',
    '@midnight-ntwrk/wallet-sdk-address-format',
    '@midnight-ntwrk/wallet-sdk-dust-wallet',
    '@midnight-ntwrk/wallet-sdk-facade',
    '@midnight-ntwrk/wallet-sdk-hd',
    '@midnight-ntwrk/wallet-sdk-shielded',
    '@midnight-ntwrk/wallet-sdk-unshielded-wallet',
  ],
  outputFileTracingRoot: process.cwd() + '/..',
  webpack: (config, { isServer }) => {
    // Enable WebAssembly experiments
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Fix: isomorphic-ws exports default only, but midnight module expects .WebSocket
    // Create a shim that re-exports with WebSocket as a named export
    config.resolve.alias = {
      ...config.resolve.alias,
      'isomorphic-ws': require.resolve('isomorphic-ws/node.js'),
    };

    // Handle WASM files properly - use webassembly/async type
    // and suppress the async/await warning for browser targets
    config.module.rules = config.module.rules.map(rule => {
      if (rule.test && rule.test.toString().includes('wasm')) {
        return {
          ...rule,
          type: 'webassembly/async',
        };
      }
      return rule;
    });

    // Only add fallbacks for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
  env: {
    MIDNIGHT_INDEXER_URI: process.env.MIDNIGHT_INDEXER_URI || 'https://indexer.preprod.midnight.network/api/v4/graphql',
    MIDNIGHT_INDEXER_WS_URI: process.env.MIDNIGHT_INDEXER_WS_URI || 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    MIDNIGHT_NODE_URI: process.env.MIDNIGHT_NODE_URI || 'wss://rpc.preprod.midnight.network',
  },
};

module.exports = nextConfig;
