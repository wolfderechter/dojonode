<script lang="ts">
  import Card from "./Card.svelte";
  import gasIcon from "../../assets/icons/Gas.avif";

  export let body: number;
</script>

<Card title="gas" icon={gasIcon}>
  <div slot="body">
    {#if body}
      {body}
    {/if}
  </div>

  <div slot="subBody">
      gwei
  </div>
</Card>
