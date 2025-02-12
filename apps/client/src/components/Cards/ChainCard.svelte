<script lang="ts">
  import Card from "./Card.svelte";

  interface Props {
    icon: string;
    body: string;
    subBody: string;
  }

  let { icon, body, subBody }: Props = $props();
</script>

<Card title="chain" {icon}>
  {#snippet cardBody()}
    <div >
      {#if body}
        {body}
      {/if}
    </div>
  {/snippet}

  {#snippet cardSubBody()}
    <div >
      {#if subBody}
        {subBody}
      {/if}
    </div>
  {/snippet}
</Card>
