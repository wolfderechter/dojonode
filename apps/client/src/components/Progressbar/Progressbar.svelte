<script lang="ts">
  interface Props {
    progress?: number;
    showPercentage?: boolean;
    widthPercentage?: number;
    heightPixels?: number;
    children?: import('svelte').Snippet<[any]>;
  }

  let {
    progress = null,
    showPercentage = null,
    widthPercentage = null,
    heightPixels = null,
    children
  }: Props = $props();
</script>

<div
  class="progress-bar"
  style="width:{widthPercentage}%; height:{heightPixels}px;"
>
  <div class="progress-bar__background">
    {#if showPercentage}
      <div class="progress-bar__text">
        {#if children}{@render children({ progress, })}{:else}
          {progress.toFixed(2)}%
        {/if}
      </div>
    {/if}
  </div>
  <div class="progress-bar__fill" style={`width: ${progress}%`}></div>
</div>

<style>
  .progress-bar {
    width: 170px;
    height: 20px;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
    margin: 0;
  }

  .progress-bar__background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: hsl(var(--twc-progressBarBackgroundColor));
    border-radius: 10px;
  }

  .progress-bar__fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background-color: hsl(var(--twc-progressBarFillColor));
    border-radius: 10px;
    transition: width 0.4s ease-in-out;
    width: 0%;
  }

  .progress-bar__text {
    position: relative;
    text-align: center;
    font-size: 12px;
    color: hsl(var(--twc-textColor));
    z-index: 1;
  }
</style>
