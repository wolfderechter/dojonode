<script lang="ts">
  import Modal from "./Modal.svelte";

  interface Props {
    title: string;
    isOpen?: boolean;
    body?: import('svelte').Snippet;
    footer?: import('svelte').Snippet;
  }

  let {
    title,
    isOpen = $bindable(false),
    body,
    footer
  }: Props = $props();
</script>

<Modal {title} bind:isOpen>
  <div class="flex h-full min-h-tooltip-modal w-full flex-col justify-between">
    <div class="tip-body mb-4 flex-auto">
      {@render body?.()}
    </div>
    <div class="tip-footer self-start">
      {@render footer?.()}
    </div>
  </div>
</Modal>
