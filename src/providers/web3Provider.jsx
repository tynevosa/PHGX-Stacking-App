"use client";

import * as React from "react";
import { WagmiProvider } from '@privy-io/wagmi';
import { mainnet, sepolia } from "wagmi/chains";
import { PrivyProvider } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from "./config";

const Web3Providers = ({ children }) => {
  const queryClient = new QueryClient();

  return (
      <PrivyProvider appId="cltyoowjo0hhe12dmnxxg7j4a"
        config={{
          appearance: {
            // Defaults to true
            defaultChain: sepolia, 
            supportedChains: [mainnet, sepolia] 
          },
          loginMethods: ['wallet','email']
        }}
      >
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={config}>
            {children}
          </WagmiProvider>
        </QueryClientProvider>
      </PrivyProvider>
  );
};

export default Web3Providers
