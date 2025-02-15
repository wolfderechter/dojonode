<script lang="ts">
  import Card from "./Card.svelte";
  import dollsIcon from "../../assets/icons/Dolls.avif";

  interface Props {
    body: number;
  }

  let { body }: Props = $props();
</script>

<Card title="peers" icon={dollsIcon}>
  {#snippet cardBody()}
    <div >
      {#if body !== null || body !== undefined}
        {body}
      {/if}
    </div>
  {/snippet}

  {#snippet cardSubBody()}
    <div >connected</div>
  {/snippet}
</Card>
