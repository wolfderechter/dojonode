<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import * as simpleDuration from "simple-duration";
  import {
    setLocalStorageItem,
    getLocalStorageItem,
  } from "../utils/localstorage";
  import DetailsModal from "../components/DetailsModal.svelte";
  import Card from "../components/Cards/Card.svelte";
  import MemoryCard from "../components/Cards/MemoryCard.svelte";
  import CpuCard from "../components/Cards/CpuCard.svelte";
  import PeersCard from "../components/Cards/PeersCard.svelte";
  import GasCard from "../components/Cards/GasCard.svelte";
  import RuntimeCard from "../components/Cards/RuntimeCard.svelte";
  import StorageCard from "../components/Cards/StorageCard.svelte";
  import NodeheightCard from "../components/Cards/NodeheightCard.svelte";
  import ChainCard from "../components/Cards/ChainCard.svelte";
  import ThemeSwitcher from "../components/ThemeSwitcher.svelte";
  import SyncProgressbar from "../components/Progressbar/SyncProgressbar.svelte";
  import checkmarkIcon from "../assets/icons/CheckMark.avif";
  import dojoScrollIcon from "../assets/icons/DojoScroll.svg";
  import warningIcon from "../assets/icons/Warning.avif";
  import loadingIcon from "../assets/icons/Hourglass.avif";
  import antennaIcon from "../assets/icons/Antenna.avif";
  import { MetricTypes, NodeTypes } from "../domain/enums";
  import type {
    Status,
    SyncState,
    Systeminfo,
    SysteminformationMetricsInterface,
  } from "../domain/types";
  import { DOJONODE_SERVER_API_URL } from "../domain/constants";

  let nodeStatus: Status = $state("loading");
  let dojonodeServerStatus = $state<Status>("loading");

  // Fetch the NODE_API_URL from backend on start, user can update (and send request to backend) if needed.
  let NODE_API_URL = $state();
  // if custom localstorage API urls exist, use those, else use the default variables from the constants.ts file
  let CUSTOM_DOJONODE_SERVER_API_URL = $state(
    getLocalStorageItem("CUSTOM_DOJONODE_SERVER_API_URL") ||
      DOJONODE_SERVER_API_URL,
  );

  // General metrics
  let chainId: number = $state();
  let nodeHeight: number = $state();
  let chainHeight: number = $state();
  let gasPrice: bigint = $state();
  let syncingState: SyncState = $state();
  let peers: number = $state(null);
  let syncingProgressPercentage = $state(0);
  let nodeType = $state(NodeTypes.Node);
  let estimatedSyncingTime: string = $state();

  if (getLocalStorageItem("nodeType")) {
    nodeType = getLocalStorageItem("nodeType");
  }

  let intervalTimer: NodeJS.Timer;
  let systeminformationMetrics: SysteminformationMetricsInterface =
    $state(null);

  // layout variables
  let connectionsOpen: boolean = $state(false);

  async function fetchConnections() {
    try {
      const connectionsResponse = await fetch(
        CUSTOM_DOJONODE_SERVER_API_URL + "/connections",
      );

      if (!connectionsResponse.ok) {
        dojonodeServerStatus = "error";
        return;
      }

      const connections = await connectionsResponse.json();

      NODE_API_URL = connections.node;

      if (connections.nodeError) {
        nodeStatus = "error";
        console.error(
          "Node connection has an error, please check if the node is running and reachable on",
          NODE_API_URL,
        );
        return;
      }
      nodeStatus = "success";
      dojonodeServerStatus = "success";
    } catch (error) {
      console.error(
        "Error fetching connections, check if dojonode-server is running and reachable",
        error,
      );
      dojonodeServerStatus = "error";
    }
  }

  // fetch general metrics from the node RPCs
  async function fetchGeneralMetrics() {
    try {
      const generalMetricsResponse = await fetch(
        CUSTOM_DOJONODE_SERVER_API_URL + "/generalMetrics",
      );

      if (!generalMetricsResponse.ok) {
        dojonodeServerStatus = "error";
      }

      const data = await generalMetricsResponse.json();

      if (data.nodeError) {
        nodeStatus = "error";
        return; // if node could not be connected, return early since there won't be any usable metrics
      }

      nodeStatus = "success";
      chainId = data.chainId;
      gasPrice = BigInt(data.gasPrice);
      peers = data.peers;
      nodeHeight = Number(data.nodeHeight);
      chainHeight = Number(data.chainHeight);
      syncingState = data.syncingState;

      if (syncingState === "syncing" && data.estimatedSyncingTimeInSeconds) {
        estimatedSyncingTime = simpleDuration.stringify(
          data.estimatedSyncingTimeInSeconds,
          "m",
        );
      }

      syncingProgressPercentage = (nodeHeight / chainHeight) * 100;

      dojonodeServerStatus = "success";
    } catch (error) {
      console.error(
        "Error fetching general metrics, check if dojonode-server is running and reachable",
        error,
      );
      dojonodeServerStatus = "error";
    }
  }

  // fetch from the nodejs api that exposes system metrics using the npm package systeminformation
  async function fetchSystemMetrics() {
    try {
      const response = await fetch(
        CUSTOM_DOJONODE_SERVER_API_URL + "/systemMetrics",
      );

      if (!response.ok) {
        dojonodeServerStatus = "error";
      }

      const systemInfo: Systeminfo = await response.json();

      const mem = systemInfo.mem;
      // find disk with biggest size, since that's probably the disk we care about
      const disk = systemInfo.disk.sort((a, b) => b.size - a.size)[0];
      const currentTime = Date.now();
      const secondsElapsed =
        Math.abs(currentTime - systemInfo.startTime) / 1000;
      const runtimeInHours = secondsElapsed / 3600;
      const runtime =
        runtimeInHours >= 1 ? runtimeInHours : runtimeInHours * 60; // if runTime < 1 hour, show it in minutes

      systeminformationMetrics = {
        memUsedGB: Number(
          ((mem.total - mem.available) / 1024 / 1024 / 1024).toFixed(2),
        ),
        memUsedPerc: Number(
          (((mem.total - mem.available) / mem.total) * 100).toFixed(2),
        ),
        cpuUsedPerc: Number(systemInfo.cpu.currentLoad.toFixed(2)),
        filestorageFreeGB: Number(
          ((disk.size - disk.used) / 1024 / 1024 / 1024).toFixed(2),
        ),
        filestorageUsedGB: Number((disk.used / 1024 / 1024 / 1024).toFixed(2)),
        filestorageUsedPerc: Number(disk.use.toFixed(2)),
        runtime: Math.max(1, Math.round(runtime)),
        runtimeMetricType:
          runtimeInHours >= 1 ? MetricTypes.hours : MetricTypes.minutes,
      };

      dojonodeServerStatus = "success";
    } catch (error) {
      console.error(
        "Error while fetching systeminfo, check if dojonode-server is running and reachable",
        error,
      );
      dojonodeServerStatus = "error";
    }
  }

  async function updateNode() {
    try {
      // Reset the node stats
      nodeStatus = "loading";
      chainId = null;
      gasPrice = null;
      peers = null;
      nodeHeight = null;
      chainHeight = null;
      syncingState = null;
      syncingProgressPercentage = null;

      const body = JSON.stringify({ node: NODE_API_URL });
      const response = await fetch(
        CUSTOM_DOJONODE_SERVER_API_URL + "/connections",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: body,
        },
      );

      if (!response.ok) {
        nodeStatus = "error";
      }

      const data = await response.json();
      nodeStatus = data.nodeStatus ? "success" : "error";
    } catch (error) {
      nodeStatus = "error";
    }
  }

  // switching the nodetype reveals/hides certain cards
  function switchNodeType(type) {
    if (nodeType === type) return; // exit if nodeType is the same as the currently selected type

    switch (type) {
      case NodeTypes.Node:
        nodeType = NodeTypes.Node;
        break;
      case NodeTypes.Validator:
        nodeType = NodeTypes.Validator;
        break;
      default:
        break;
    }

    setLocalStorageItem("nodeType", nodeType);
  }

  onMount(async () => {
    // Fire these fetches immediately
    fetchConnections();
    fetchGeneralMetrics();
    fetchSystemMetrics();

    // Interval to fetch metrics every 30 seconds
    intervalTimer = setInterval(async () => {
      try {
        fetchGeneralMetrics();
        fetchSystemMetrics();
      } catch (e) {
        console.error(e);
      }
    }, 3000);
  });

  onDestroy(() => {
    if (intervalTimer) clearInterval(intervalTimer as any);
  });
</script>

<div class="flex flex-col items-center">
  <div class="text-center relative pt-14 md:pt-10">
    <section>
      <div class="mx-auto relative">
        <span>
          <span class="text-[#5CAA80] font-bold">dojo</span>
          <img src={dojoScrollIcon} class="icon-big m-auto" alt="dojo flag" />
        </span>
      </div>
    </section>

    <div class="nodeTypes flex justify-evenly mt-4">
      <button
        class:active={nodeType === NodeTypes.Node}
        onclick={() => switchNodeType(NodeTypes.Node)}>node</button
      >
      <span class="bar">|</span>
      <button
        class:active={nodeType === NodeTypes.Validator}
        onclick={() => switchNodeType(NodeTypes.Validator)}>validator</button
      >
    </div>
  </div>

  <!-- Progress Bar -->
  <div class="my-4 text-center">
    <SyncProgressbar {syncingState} progress={syncingProgressPercentage} />
    {#if estimatedSyncingTime && syncingState === "syncing"}
      <span class="text-[12px] text-[var(--cardSubBodyColor)]"
        >{estimatedSyncingTime}</span
      >
    {/if}
  </div>

  <div class="max-w-[35rem] sticky sm:justify-center">
    <div class="left-[20px] top-[-37px] absolute">
      <ThemeSwitcher />
    </div>
    <button
      id="connectionsBtn"
      class="w-[30px] h-[30px] absolute right-[7px] mr-[6px] top-[-37px] cursor-pointer"
      onclick={() => (connectionsOpen = true)}
    >
      <img
        src={antennaIcon}
        class={dojonodeServerStatus === "error" || nodeStatus === "error"
          ? "animateConnections"
          : ""}
        alt="antenna icon"
      />
    </button>

    <div
      id="cards"
      class="mt-[1px] flex flex-wrap justify-center overflow-y-clip"
    >
      <ChainCard {chainId} />
      <MemoryCard
        body={systeminformationMetrics?.memUsedGB}
        subBody={systeminformationMetrics?.memUsedPerc}
        progress={systeminformationMetrics?.memUsedPerc}
      />
      <CpuCard
        body={systeminformationMetrics?.cpuUsedPerc}
        progress={systeminformationMetrics?.cpuUsedPerc}
      />
      <StorageCard
        body={systeminformationMetrics?.filestorageUsedGB}
        subBody={systeminformationMetrics?.filestorageUsedPerc}
        progress={systeminformationMetrics?.filestorageUsedPerc}
      />
      <NodeheightCard body={nodeHeight} subBody={chainHeight} />
      <PeersCard body={peers} />
      <RuntimeCard
        body={systeminformationMetrics?.runtime}
        subBody={systeminformationMetrics?.runtimeMetricType}
      />
      <GasCard body={gasPrice} />
      <!-- Invisible cards that push any incomplete rows of cards to the left -->
      <div class="invisible h-5">
        <Card />
      </div>
      <div class="invisible h-5">
        <Card />
      </div>
      <div class="invisible h-5">
        <Card />
      </div>
    </div>
  </div>
</div>

{#if connectionsOpen}
  <DetailsModal title={"Connections"} bind:isOpen={connectionsOpen}>
    {#snippet body()}
      <div
        class="connections grid grid-cols-1 gap-6 mx-5 my-10 max-h-96 overflow-y-auto text-[var(--textColor)]"
      >
        <div
          class="flex sm:flex-row flex-col justify-between items-center font-bold"
        >
          node
          <div class="ml-2 w-72 flex items-center">
            <input
              class="shadow appearance-none rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline mt-1"
              type="text"
              bind:value={NODE_API_URL}
              placeholder="http://localhost:8545"
              onchange={() => {
                updateNode();
              }}
            />
            <img
              src={nodeStatus === "loading"
                ? loadingIcon
                : nodeStatus === "error"
                  ? warningIcon
                  : checkmarkIcon}
              alt="icon"
              class="w-[30px] ml-2"
            />
          </div>
        </div>
        <div
          class="flex sm:flex-row flex-col justify-between items-center font-bold"
        >
          dojonode-server
          <div class="ml-2 w-72 flex items-center">
            <input
              class="shadow appearance-none rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              bind:value={CUSTOM_DOJONODE_SERVER_API_URL}
              placeholder={DOJONODE_SERVER_API_URL}
              onchange={() => {
                // reset dojonode stats
                dojonodeServerStatus = "loading";
                systeminformationMetrics = null;

                setLocalStorageItem(
                  "CUSTOM_DOJONODE_SERVER_API_URL",
                  CUSTOM_DOJONODE_SERVER_API_URL,
                );
                // fetch metrics from the new API
                fetchConnections();
                fetchGeneralMetrics();
                fetchSystemMetrics();
              }}
            />
            <img
              src={dojonodeServerStatus === "loading"
                ? loadingIcon
                : dojonodeServerStatus === "error"
                  ? warningIcon
                  : checkmarkIcon}
              alt="icon"
              class="w-[30px] ml-2"
            />
          </div>
        </div>
      </div>
    {/snippet}
  </DetailsModal>
{/if}

<style>
  .nodeTypes {
    color: var(--textColor);
    font-weight: 400;
    z-index: 1;
    position: relative;
    width: 200px;
    margin-left: auto;
    margin-right: auto;
  }

  .nodeTypes .active {
    color: var(--nodeTypesColorActive);
    font-weight: 600;
  }

  .nodeTypes .bar {
    margin-top: auto;
    margin-bottom: auto;
    color: var(--textColor);
    font-weight: 400;
  }

  .connections input {
    background-color: var(--inputAccentColor);
  }

  .animateConnections {
    animation: animateConnections 1.5s infinite;
  }

  @keyframes animateConnections {
    0% {
      transform: rotate(0deg);
    }
    8.0% {
      transform: rotate(0deg);
    }
    12.0% {
      transform: rotate(35deg);
    }
    16.0% {
      transform: rotate(-30deg);
    }
    20.0% {
      transform: rotate(0deg);
    }
    23.0% {
      transform: rotate(28deg);
    }
    26.0% {
      transform: rotate(-20deg);
    }
    29.0% {
      transform: rotate(0deg);
    }
    31.0% {
      transform: rotate(16deg);
    }
    33.0% {
      transform: rotate(-12deg);
    }
    35.0% {
      transform: rotate(0deg);
    }
    37.0% {
      transform: rotate(-6deg);
    }
    39.0% {
      transform: rotate(0deg);
    }
  }

  section {
    color: var(--textColor);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 0.6;
    width: 50%;
    margin-left: auto;
    margin-right: auto;
    text-align: center;
  }

  @media only screen and (max-width: 600px) {
    section {
      width: 90%;
    }
  }
  @media only screen and (max-width: 1260px) {
    section {
      width: 75%;
    }
  }
  .icon-big {
    width: 100px;
  }
</style>
