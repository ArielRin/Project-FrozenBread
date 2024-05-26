import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider, darkTheme, Chain } from "@rainbow-me/rainbowkit";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { publicProvider } from "wagmi/providers/public";
import { ChakraProvider } from "@chakra-ui/react";



const bsc: Chain = {
  id: 56,
  name: 'Binance Smart Chain',
  network: 'bsc',
  iconBackground: '#000',
  iconUrl: 'https://assets.pancakeswap.finance/web/chains/56.png',
  nativeCurrency: {
    decimals: 18,
    name: 'Binance Coin',
    symbol: 'BNB',
  },
  rpcUrls: {
    default: 'https://bsc-dataseed.binance.org/',
  },
  blockExplorers: {
    default: { name: 'BscScan', url: 'https://bscscan.com/' },
  },
  testnet: false,
};

const base: Chain = {
  id: 8453,
  name: 'Base Mainnet',
  network: 'base',
  iconBackground: '#000',
  iconUrl: 'https://avatars.githubusercontent.com/u/108554348?s=280&v=4',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: 'https://mainnet.base.org/',
  },
  blockExplorers: {
    default: { name: 'BaseScan', url: 'https://basescan.org/' },
  },
  testnet: false,
};

const cronos: Chain = {
  id: 25,
  name: 'Cronos',
  network: 'cronos',
  iconBackground: '#000',
  iconUrl: 'https://cronoscan.com/images/brandassets/logo.jpg',
  nativeCurrency: {
    decimals: 18,
    name: 'Cro Coin',
    symbol: 'CRO',
  },
  rpcUrls: {
    default: 'https://evm.cronos.org/',
  },
  blockExplorers: {
    default: { name: 'CroScan', url: 'https://explorer.cronos.org/' },
  },
  testnet: false,
};

const mainnet: Chain = {
  id: 1,
  name: 'Ethereum',
  network: 'mainnet',
  iconBackground: '#000',
  iconUrl: 'https://tokens.pancakeswap.finance/images/0x2170Ed0880ac9A755fd29B2688956BD959F933F8.png',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: 'https://mainnet.infura.io/v3/',
  },
  blockExplorers: {
    default: { name: 'Etherscan', url: 'https://etherscan.io' },
  },
  testnet: false,
};

const bsctestnet: Chain = {
  id: 97,
  name: 'BSC Testnet',
  network: 'bsctestnet',
  iconBackground: '#000',
  iconUrl: 'https://assets.pancakeswap.finance/web/chains/56.png',
  nativeCurrency: {
    decimals: 18,
    name: 'tBNB',
    symbol: 'tBNB',
  },
  rpcUrls: {
    default: 'https://data-seed-prebsc-1-s3.binance.org:8545/',
  },
  blockExplorers: {
    default: { name: 'TestnetBSCscan', url: 'https://testnet.bscscan.com/' },
  },
  testnet: false,
};


const arbitrum: Chain = {
  id: 42161,
  name: 'Arbitrum One',
  network: 'arbitrum',
  iconBackground: '#000',
  iconUrl: 'https://www.crypto-nation.io/cn-files/uploads/2021/10/Arbitrum-logo.png',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: 'https://arb1.arbitrum.io/rpc/',
  },
  blockExplorers: {
    default: { name: 'Arbiscan', url: 'https://arbiscan.io' },
  },
  testnet: false,
};


const pulse: Chain = {
  id: 369,
  name: 'PulseChain',
  network: 'pulse',
  iconBackground: '#000',
  iconUrl: 'https://tokens.app.pulsex.com/images/tokens/0xA1077a294dDE1B09bB078844df40758a5D0f9a27.png',
  nativeCurrency: {
    decimals: 18,
    name: 'Pulse',
    symbol: 'PLS',
  },
  rpcUrls: {
    default: 'https://rpc.pulsechain.com',
  },
  blockExplorers: {
    default: { name: 'Pulse Explorer', url: 'https://scan.pulsechain.com' },
  },
  testnet: false,
};

const maxxChain: Chain = {
  id: 10201,
  name: 'Maxx Chain',
  network: 'maxxchain',
  iconBackground: '#000',
  iconUrl: 'https://beamish-malasada-71de28.netlify.app/images/tokens/0xA29D0ee618f33d8eFE9A20557fd0EF63dD050859.png',
  nativeCurrency: {
    decimals: 18,
    name: 'Power',
    symbol: 'PWR',
  },
  rpcUrls: {
    default: 'https://mainrpc.maxxchain.org/',
  },
  blockExplorers: {
    default: { name: 'Maxx Explorer', url: 'https://scan.maxxchain.org/' },
  },
  testnet: false,
};

const sepolia: Chain = {
  id: 11155111,
  name: 'Sepolia Testnet',
  network: 'sepolia',
  iconBackground: '#000',
  iconUrl: 'https://tokens.pancakeswap.finance/images/0x2170Ed0880ac9A755fd29B2688956BD959F933F8.png',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: 'https://sepolia.infura.io/v3/',
  },
  blockExplorers: {
    default: { name: 'Etherscan Sepolia', url: 'https://sepolia.etherscan.io/' },
  },
  testnet: false,
};


const { chains, provider } = configureChains(
  // [ mainnet, bsc, base, cronos, arbitrum, pulse, maxxChain, bsctestnet, sepolia],

    [bsctestnet],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id === bsc.id) return { http: "https://bsc-dataseed.binance.org/" };
        if (chain.id === base.id) return { http: "https://mainnet.base.org/" };
        if (chain.id === arbitrum.id) return { http: "https://arb1.arbitrum.io/rpc/" };
        if (chain.id === maxxChain.id) return { http: "https://mainrpc.maxxchain.org/" };
        if (chain.id === pulse.id) return { http: "https://rpc.pulsechain.com/" };
        if (chain.id === cronos.id) return { http: "https://evm.cronos.org/" };
        if (chain.id === mainnet.id) return { http: "https://mainnet.infura.io/v3/" };
        if (chain.id === bsctestnet.id) return { http: "https://data-seed-prebsc-1-s3.binance.org:8545/" };
        if (chain.id === sepolia.id) return { http: "https://sepolia.infura.io/v3/" };
        return { http: chain.rpcUrls.default };
      },
    }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "Fk Yeah Contracts 2024",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider modalSize="compact" chains={chains}
        theme={darkTheme({
              accentColor: '#4b99ff',
              accentColorForeground: 'white',
              borderRadius: 'small',
              fontStack: 'system',
              overlayBlur: 'small',
            })}

        >
          <App />
        </RainbowKitProvider>
      </WagmiConfig>
    </ChakraProvider>
  </React.StrictMode>
);
