<script lang="ts">
  import Card from "./Card.svelte";
  import heartIcon from "../../assets/icons/Heart.avif";

  export let body: number;
  export let progress: number;
</script>

<Card title="cpu" icon={heartIcon} loadingbar={true} {progress}>
  <div slot="body">
    {#if body}
      {body}
    {/if}
  </div>

  <div slot="subBody">%</div>
</Card>
