<script lang="ts">
  import Card from "./Card.svelte";
  import ethIcon from "../../assets/icons/Ethereum.avif";
  import taikoIcon from "../../assets/taikoLogoIcon.png";

  interface Props {
    chainId: number;
  }

  let { chainId }: Props = $props();

  function getChainData(chainId: number) {
    switch(chainId) {
      case 0: // Ethereum
        return {
          network: "ethereum",
          icon: ethIcon
        };
      case 100: // Gnosis
        return {
          network: "gnosis",
          icon: ethIcon
        };
      case 167000: // Taiko
        return {
          network: "taiko",
          icon: taikoIcon
        };
      default:
        return {
          network: undefined,
          icon: undefined
        };
    }
  }

  const chainData = $derived(getChainData(chainId));
  const network = $derived(chainData.network);
  const icon = $derived(chainData.icon);
</script>

<Card title="chain" icon={icon ?? null}>
  {#snippet cardBody()}
    <div>
      {#if network}
        {network}
      {/if}
    </div>
  {/snippet}
</Card>
