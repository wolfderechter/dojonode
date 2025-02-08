<script lang="ts">
  import Progressbar from "./Progressbar.svelte";
  export let progress: number;
  export let syncingState;
</script>

<Progressbar {progress} showPercentage={true}>
  {#if syncingState === "succes"}
    synced!
  {:else if syncingState === "syncing"}
    {progress.toFixed(2) + "%"}
  {:else if syncingState === "error"}
    something went wrong
  {:else}
    loading...
  {/if}
</Progressbar>
