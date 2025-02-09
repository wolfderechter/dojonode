<script lang="ts">
  import Card from "./Card.svelte";
  import fileboxIcon from "../../assets/icons/FileBox.avif";

  export let body: number;
  export let subBody: number;
  export let progress: number;
</script>

<Card title="storage" icon={fileboxIcon} loadingbar={true} {progress}>
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
