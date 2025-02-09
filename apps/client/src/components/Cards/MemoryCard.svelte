<script lang="ts">
  import Card from "./Card.svelte";
  import brainIcon from "../../assets/icons/Brain.avif";

  export let body: number;
  export let subBody: number;
  export let progress: number;
</script>

<Card title="memory" icon={brainIcon} loadingbar={true} {progress}>
  <div slot="body">
    {#if body}
      {body} GB
    {/if}
  </div>

  <div slot="subBody">
    {#if subBody}
      {subBody} %
    {/if}
  </div>
</Card>
