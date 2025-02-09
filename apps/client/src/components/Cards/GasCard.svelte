<script lang="ts">
  import Card from "./Card.svelte";
  import gasIcon from "../../assets/icons/Gas.avif";

  interface Props {
    body: number;
  }

  let { body }: Props = $props();
</script>

<Card title="gas" icon={gasIcon}>
  {#snippet body()}
    <div >
      {#if body}
        {body}
      {/if}
    </div>
  {/snippet}

  {#snippet subBody()}
    <div >
        gwei
    </div>
  {/snippet}
</Card>
