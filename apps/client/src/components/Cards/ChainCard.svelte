<script lang="ts">
  import Card from "./Card.svelte";
  import { getChainInfo } from "../../utils/chain";
  import ethIcon from "../../assets/chains/Ethereum.avif";
  import gnosisIcon from "../../assets/chains/Gnosis.avif";
  import taikoIcon from "../../assets/chains/Taiko.avif";

  interface Props {
    chainId?: number;
  }

  let { chainId }: Props = $props();

  const ICONS = {
    1: ethIcon,
    100: gnosisIcon,
    167000: taikoIcon,
  };

  const chain = $derived(chainId ? getChainInfo(chainId).name : null);
  const icon = $derived(chainId ? ICONS[chainId] : null);
</script>

<Card title="chain" {icon}>
  {#snippet cardBody()}
    <div>
      {#if chain}
        {chain}
      {/if}
    </div>
  {/snippet}

  {#snippet cardSubBody()}
    <div>
      {#if isTestnet}
        testnet
      {/if}
    </div>
  {/snippet}
</Card>
