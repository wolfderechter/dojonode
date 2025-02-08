<script lang="ts">
  import Progressbar from "./Progressbar/Progressbar.svelte";
  import { MetricTypes } from "../domain/enums";

  export let title: string = null;
  export let body: number = null;
  export let bodyMetricType = null;
  export let subBody: number = null;
  export let subBodyMetricType = null;
  export let icon: string = null;
  export let loadingbar: boolean = null;
  export let progress: number = null;

  $: bodyString = body?.toLocaleString("en", { maximumFractionDigits: 2 });
  $: subBodyString = subBody?.toLocaleString("en", {
    maximumFractionDigits: 2,
  });
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

      <!-- TODO: Try to clean up this mess? -->
      <div class="bodyArea flex flex-col my-auto w-[90%]">
        {#if body !== undefined && body !== null}
          <!-- Wallet -->
          <div
            class="flex items-center {bodyMetricType === MetricTypes.ethereum &&
            subBodyMetricType === MetricTypes.ethereum
              ? "justify-between"
              : "flex-col"}"
          >
              <!-- Nodeheight card-->
            {#if bodyMetricType && bodyMetricType === MetricTypes.blockheight && subBody !== null && subBodyMetricType === MetricTypes.blockheight}
              {bodyString}
              <!-- Card has only a percentage, so the percentage gets shown on the second row with brackets (cpu)-->
            {:else if bodyMetricType && subBody === null && bodyMetricType === MetricTypes.percentage}
              {bodyString}
              <span class="modal-sub-body">[ {bodyMetricType} ]</span>
              <!-- Normal cards that require 1 row (proposed/proven and runtime )-->
            {:else if bodyMetricType && subBody === null}
              {bodyString}
              <span class="modal-sub-body">{bodyMetricType}</span>
              <!-- Normal cards that require 2 rows (memory and storage)-->
            {:else}
              {bodyString}
              {bodyMetricType}
            {/if}
          </div>
        {/if}
        {#if subBody !== undefined && subBody !== null}
          <div
            class="modal-sub-body flex items-center justify-center"
          >
              {subBodyString}
              {subBodyMetricType}
          </div>
        {/if}
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
