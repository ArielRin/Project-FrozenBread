// global.d.ts
import { ExternalProvider } from '@ethersproject/providers';

declare global {
  interface Ethereum extends ExternalProvider {
    isMetaMask?: boolean;
    request(args: { method: string; params?: any[] }): Promise<any>;
  }

  interface Window {
    ethereum?: Ethereum;
  }
}
