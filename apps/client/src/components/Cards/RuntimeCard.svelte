<script lang="ts">
  import Card from "./Card.svelte";
  import timerclockIcon from "../../assets/icons/Timer_Clock.avif";

  interface Props {
    body: number;
    subBody: number;
  }

  let { body, subBody }: Props = $props();
</script>

<Card title="runtime" icon={timerclockIcon}>
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
