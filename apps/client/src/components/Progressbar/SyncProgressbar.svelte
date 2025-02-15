<script lang="ts">
  import type { SyncState } from "src/domain/types";
  import Progressbar from "./Progressbar.svelte";

  interface Props {
    progress: number;
    syncingState: SyncState;
  }

  let { progress, syncingState }: Props = $props();
</script>

<Progressbar {progress} showPercentage={true}>
  {#if syncingState === "synced"}
    synced!
  {:else if syncingState === "syncing"}
    {progress.toFixed(2) + "%"}
  {:else if syncingState === "error"}
    something went wrong
  {:else}
    loading...
  {/if}
</Progressbar>
