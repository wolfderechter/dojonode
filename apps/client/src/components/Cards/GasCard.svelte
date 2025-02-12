<script lang="ts">
  import Card from "./Card.svelte";
  import gasIcon from "../../assets/icons/Gas.avif";
  import { formatGwei } from "viem";

  interface Props {
    body: bigint;
  }

  let { body }: Props = $props();
</script>

<Card title="gas" icon={gasIcon}>
  {#snippet cardBody()}
    <div >
      {#if body}
        {Number(formatGwei(body)).toFixed(2)}
      {/if}
    </div>
  {/snippet}

  {#snippet cardSubBody()}
    <div >
        gwei
    </div>
  {/snippet}
</Card>
