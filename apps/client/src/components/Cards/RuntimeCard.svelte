<script lang="ts">
  import Card from "./Card.svelte";
  import timerclockIcon from "../../assets/icons/Timer_Clock.avif";

  export let body: number;
  export let subBody: number;
</script>

<Card title="runtime" icon={timerclockIcon}>
  <div slot="body">
    {#if body}
      {body}
    {/if}
  </div>

  <div slot="subBody">
    {#if subBody}
      {subBody}
    {/if}
  </div>
</Card>
