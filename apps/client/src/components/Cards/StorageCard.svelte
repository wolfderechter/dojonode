<script lang="ts">
  import Card from "./Card.svelte";
  import fileboxIcon from "../../assets/icons/FileBox.avif";

  interface Props {
    body: number;
    subBody: number;
    progress: number;
  }

  let { body, subBody, progress }: Props = $props();
</script>

<Card title="storage" icon={fileboxIcon} loadingbar={true} {progress}>
  {#snippet body()}
    <div >
      {#if body}
        {body} GB
      {/if}
    </div>
  {/snippet}

  {#snippet subBody()}
    <div >
      {#if subBody}
        {subBody} %
      {/if}
    </div>
  {/snippet}
</Card>
