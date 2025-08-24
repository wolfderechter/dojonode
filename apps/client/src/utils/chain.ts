import ethIcon from "../assets/chains/Ethereum.avif";
import gnosisIcon from "../assets/chains/Gnosis.avif";
import taikoIcon from "../assets/chains/Taiko.avif";
import defaultIcon from "../assets/icons/Questionmark.avif";

export const CHAINS = {
  1: {
    name: "Ethereum",
    rpc: "https://eth.llamarpc.com",
    icon: ethIcon
  },
  100: {
    name: "Gnosis",
    rpc: "https://rpc.gnosischain.com",
    icon: gnosisIcon
  },
  10200: {
    name: "Chiado",
    isTestnet: true,
    rpc: "https://rpc.chiadochain.net",
    icon: gnosisIcon
  },
  17000: {
    name: "Holesky",
    isTestnet: true,
    rpc: "https://ethereum-holesky-rpc.publicnode.com",
    icon: ethIcon
  },
  167000: {
    name: "Taiko Alethia",
    rpc: "https://rpc.taiko.xyz",
    icon: taikoIcon
  },
};

export function getChainInfo(chainId: number) {
  // TODO: set some default icon if chain is not found
  return CHAINS[chainId] || { name: "Unknown", rpc: null, icon: defaultIcon, chainNotFound: true };
}
