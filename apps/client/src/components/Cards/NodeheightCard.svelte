<script lang="ts">
  import Card from "./Card.svelte";
  import chainIcon from "../../assets/icons/Chain.avif";

  interface Props {
    body: number;
    subBody: number;
  }

  let { body, subBody }: Props = $props();
</script>

<Card title="nodeheight" icon={chainIcon}>
  {#snippet cardBody()}
    <div >
      {#if body !== null && body !== undefined}
        {body.toLocaleString("en")}
      {/if}
    </div>
  {/snippet}

  {#snippet cardSubBody()}
    <div >
      {#if subBody !== null && subBody !== undefined}
        of {subBody.toLocaleString("en")}
      {/if}
    </div>
  {/snippet}
</Card>
