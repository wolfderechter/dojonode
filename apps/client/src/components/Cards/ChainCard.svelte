<script lang="ts">
  import Card from "./Card.svelte";

  export let icon: string;
  export let body: string;
  export let subBody: string;
</script>

<Card title="chain" {icon}>
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
