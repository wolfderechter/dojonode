<script lang="ts">
  import Progressbar from "../Progressbar/Progressbar.svelte";

  interface Props {
    title?: string;
    icon?: string;
    loadingbar?: boolean;
    progress?: number;
    body?: import('svelte').Snippet;
    subBody?: import('svelte').Snippet;
  }

  let {
    title = null,
    icon = null,
    loadingbar = null,
    progress = null,
    body,
    subBody
  }: Props = $props();
</script>

<div class="card modal shadow-md">
  <h3 class="modal-title">{title}</h3>
  <div class="flex flex-col h-[125px]">
    <div
      class="flex content-between items-center h-[100px] justify-around flex-col"
    >
      <div class="w-[45px]">
        <img src={icon} alt="icon" />
      </div>

      <div class="bodyArea flex flex-col my-auto w-[90%]">
        {@render body?.()}
        <span class="modal-sub-body">
          {@render subBody?.()}
        </span>
      </div>
    </div>

    <div class="width-[100%] text-center mt-auto mb-[12px]">
      {#if loadingbar}
        <Progressbar
          {progress}
          showPercentage={false}
          widthPercentage={100}
          heightPixels={10}
        />
      {/if}
    </div>
  </div>
</div>

<style>
  .modal {
    align-items: center;
    padding: 10px 20px;
    margin: 6px;
    border: 1px solid hsl(var(--twc-cardBackgroundColor));
    border-radius: 20px;
    background-color: hsl(var(--twc-cardBackgroundColor));
    aspect-ratio: 1/1;
    height: 170px;
  }

  .modal-title {
    margin-bottom: 10px;
    text-align: center;
    color: hsl(var(--twc-cardTitleColor));
    font-size: 18px;
    font-size: large;
    font-weight: 600;
  }

  .modal-sub-body {
    color: hsl(var(--twc-cardSubBodyColor));
    font-size: 14px;
  }
  .bodyArea {
    text-align: center;
    padding-top: 5px;
    color: hsl(var(--twc-textColor));
    font-weight: 400;
  }

  @media (max-width: 750px) {
    .modal {
      margin: 4px;
    }
  }
</style>
