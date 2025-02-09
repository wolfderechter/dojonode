<script lang="ts">
  import Card from "./Card.svelte";
  import heartIcon from "../../assets/icons/Heart.avif";

  interface Props {
    body: number;
    progress: number;
  }

  let { body, progress }: Props = $props();
</script>

<Card title="cpu" icon={heartIcon} loadingbar={true} {progress}>
  {#snippet body()}
    <div >
      {#if body}
        {body}
      {/if}
    </div>
  {/snippet}

  {#snippet subBody()}
    <div >%</div>
  {/snippet}
</Card>
