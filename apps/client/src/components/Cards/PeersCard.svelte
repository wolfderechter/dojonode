<script lang="ts">
  import Card from "./Card.svelte";
  import dollsIcon from "../../assets/icons/Dolls.avif";

  interface Props {
    body: number;
  }

  let { body }: Props = $props();
</script>

<Card title="peers" icon={dollsIcon}>
  {#snippet body()}
    <div >
      {#if body}
        {body}
      {/if}
    </div>
  {/snippet}

  {#snippet subBody()}
    <div >connected</div>
  {/snippet}
</Card>
