import { defineChain } from "viem";

export const Binancechain = /*#__PURE__*/ defineChain({
  id: 88882,
  name: "Binance Smart Chain",
  network: "binancechain",
  nativeCurrency: {
    decimals: 18,
    name: "Binance Smart Chain",
    symbol: "BNB",
  },
  rpcUrls: {
    default: { http: ["https://spicy-rpc.chiliz.com"] },
    public: { http: ["https://spicy-rpc.chiliz.com"] },
  },
});
