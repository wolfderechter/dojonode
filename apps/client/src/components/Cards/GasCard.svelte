<script lang="ts">
  import Card from "./Card.svelte";
  import gasIcon from "../../assets/icons/Gas.avif";

  interface Props {
    body: number;
  }

  let { body }: Props = $props();
</script>

<Card title="gas" icon={gasIcon}>
  {#snippet cardBody()}
    <div >
      {#if body}
        {body}
      {/if}
    </div>
  {/snippet}

  {#snippet cardSubBody()}
    <div >
        gwei
    </div>
  {/snippet}
</Card>
