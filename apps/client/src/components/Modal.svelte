<script lang="ts">
  interface Props {
    title?: string;
    isOpen?: boolean;
    onClose?: () => void;
    showXButton?: boolean;
    children?: import('svelte').Snippet;
  }

  let {
    title = null,
    isOpen = $bindable(false),
    onClose = null,
    showXButton = true,
    children
  }: Props = $props();

  const onCloseClicked = () => {
    isOpen = false;
    if (onClose) {
      onClose();
    }
  };
</script>

<svelte:window
  onkeydown={function (e) {
    if (e.key === "Escape") {
      onCloseClicked();
    }
  }}
/>
<div
  class="modal bg-[var(--cardBackgroundColor)] absolute top-[50%] left-[50%] z-50 translate-x-[-50%] translate-y-[-50%] rounded-[20px] md:w-[650px] w-[350px] shadow-2xl"
  class:modal-open={isOpen}
>
  <div class="modal-box bg-dark-2">
    <h3
      class="font-bold text-lg text-center mt-4 text-[var(--nodeTypesColorActive)]"
    >
      {title}
    </h3>
    {#if showXButton}
      <div class="modal-action mt-0">
        <button
          type="button"
          class="btn btn-sm btn-circle absolute right-[20px] top-[15px] cursor-pointer font-sans text-2xl text-[var(--nodeTypesColorActive)]"
          onclick={onCloseClicked}
        >
          &times;
        </button>
      </div>
    {/if}
    <div class="modal-body">
      {@render children?.()}
    </div>
  </div>
</div>
<div class="background z-[1]"></div>

<style>
  .modal {
    align-items: center;
  }
  .background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(3px);
  }
</style>
