<script lang="ts">
  import Card from "./Card.svelte";
  import dollsIcon from "../../assets/icons/Dolls.avif";

  export let body: number;
</script>

<Card title="peers" icon={dollsIcon}>
  <div slot="body">
    {#if body}
      {body}
    {/if}
  </div>

  <div slot="subBody">connected</div>
</Card>
