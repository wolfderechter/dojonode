<script lang="ts">
  import Card from "./Card.svelte";
  import { getChainInfo } from "../../utils/chain";

  interface Props {
    chainId?: number;
  }

  let { chainId }: Props = $props();

  const chainInfo = $derived(getChainInfo(chainId));
  const chain = $derived(chainInfo.name);
  const isTestnet: boolean = $derived(chainInfo.isTestnet);
  const icon = $derived(chainInfo.icon);
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
