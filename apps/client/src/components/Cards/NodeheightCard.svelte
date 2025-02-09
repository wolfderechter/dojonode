<script lang="ts">
  import Card from "./Card.svelte";
  import chainIcon from "../../assets/icons/Chain.avif";

  export let body: number;
  export let subBody: number;
</script>

<Card title="nodeheight" icon={chainIcon}>
  <div slot="body">
    {#if body}
      {body}
    {/if}
  </div>

  <div slot="subBody">
    {#if subBody}
      of {subBody}
    {/if}
  </div>
</Card>
