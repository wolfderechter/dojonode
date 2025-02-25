export const CHAINS = {
  1: {
    name: "Ethereum",
    rpc: "https://eth.llamarpc.com",
  },
  100: {
    name: "Gnosis",
    rpc: "https://rpc.gnosischain.com",
  },
  10200: {
    name: "Chiado",
    isTestnet: true,
    rpc: "https://rpc.chiadochain.net",
  },
  17000: {
    name: "Holesky",
    isTestnet: true,
    rpc: "https://ethereum-holesky-rpc.publicnode.com",
  },
  167000: {
    name: "Taiko Alethia",
    rpc: "https://rpc.taiko.xyz",
  },
};

export function getChainInfo(chainId: number) {
  return CHAINS[chainId] || { name: null, rpc: null };
}
