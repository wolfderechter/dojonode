<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import * as simpleDuration from "simple-duration";
  import { queryPrometheus } from "../utils/prometheus";
  import { initializeRPCConnection } from "../utils/connection";
  import {
    setLocalStorageItem,
    getLocalStorageItem,
  } from "../utils/localstorage";
  import DetailsModal from "../components/DetailsModal.svelte";
  import Card from "../components/Card.svelte";
  import ChainCard from "../components/ChainCard.svelte";
  import ThemeSwitcher from "../components/ThemeSwitcher.svelte";
  import Progressbar from "../components/Progressbar.svelte";
  import purseIcon from "../assets/icons/Purse.avif";
  import heartIcon from "../assets/icons/Heart.avif";
  import brainIcon from "../assets/icons/Brain.avif";
  import dollsIcon from "../assets/icons/Dolls.avif";
  import checkmarkIcon from "../assets/icons/CheckMark.avif";
  import fileboxIcon from "../assets/icons/FileBox.avif";
  import dojoScrollIcon from "../assets/icons/DojoScroll.svg";
  import chainIcon from "../assets/icons/Chain.avif";
  import packageIcon from "../assets/icons/Package.avif";
  import abacusIcon from "../assets/icons/Abacus.avif";
  import gasIcon from "../assets/icons/Gas.avif";
  import timerclockIcon from "../assets/icons/Timer_Clock.avif";
  import warningIcon from "../assets/icons/Warning.avif";
  import antennaIcon from "../assets/icons/Antenna.avif";
  import ethIcon from "../assets/icons/Ethereum.avif";
  import { MetricTypes, NodeTypes } from "../domain/enums";
  import type {
  Systeminfo,
    SysteminformationMetricsInterface,
  } from "../domain/types";
  import {
    ETH_RPC_API_URL,
    MYNODE_API_URL,
    PROMETHEUS_API_URL,
    SYSTEMINFO_API_URL,
  } from "../domain/constants";

  let selected = 'mainnet'
  let myNode;
  let ethRPC;
  let fetchSystemInfoError = false;
  let fetchPrometheusError = false;
  let fetchMyNodeError = false;
  let fetchEthRPCError = false;
  let fetchEventIndexerError = false;
  $:hasError = fetchSystemInfoError ||
      fetchPrometheusError ||
      fetchMyNodeError ||
      fetchEthRPCError ||
      fetchEventIndexerError;

  // Syncing estimation
  let startNodeHeight;
  let startTime = Date.now();
  let currentNodeheight;
  let currentTime;
  let estimatedSyncingTime;

  // if custom localstorage API urls exist, use those, else use the default variables from the constants.ts file
  let CUSTOM_ETH_RPC_API_URL =
    getLocalStorageItem("CUSTOM_ETH_RPC_API_URL") || ETH_RPC_API_URL;
  let CUSTOM_MYNODE_API_URL =
    getLocalStorageItem("CUSTOM_MYNODE_API_URL") || MYNODE_API_URL;
  let CUSTOM_PROMETHEUS_API_URL =
    getLocalStorageItem("CUSTOM_PROMETHEUS_API_URL") || PROMETHEUS_API_URL;
  let CUSTOM_SYSTEMINFO_API_URL =
    getLocalStorageItem("CUSTOM_SYSTEMINFO_API_URL") || SYSTEMINFO_API_URL;

  // Initialize the web3 RPC connections with error handling to see if we have provided a valid RPC provider
  async function initConnections() {
    const timeout = 5000; // Set your maximum time in milliseconds

    const myNodePromise = initializeRPCConnection(CUSTOM_MYNODE_API_URL);
    const ethRPCPromise = initializeRPCConnection(CUSTOM_ETH_RPC_API_URL);

    // Start connections concurrently
    const myNodeResponse = Promise.race([
      myNodePromise,
      new Promise(resolve => setTimeout(resolve, timeout, { web3Instance: null, fetchErrorBoolean: true }))
    ]);

    const ethRPCResponse = Promise.race([
      ethRPCPromise,
      new Promise(resolve => setTimeout(resolve, timeout, { web3Instance: null, fetchErrorBoolean: true }))
    ]);

    // Set the web3 RPC instances and handle errors
    myNodeResponse.then((response: any) => {
      myNode = response.web3Instance;
      fetchMyNodeError = response.fetchErrorBoolean;
      if (fetchMyNodeError)
        console.error(`Error while connecting to the NODE RPC at ${CUSTOM_MYNODE_API_URL}. The node IP address or port might be wrong. Or the port might be blocked by a firewall.`);
    });

    ethRPCResponse.then((response: any) => {
      ethRPC = response.web3Instance;
      fetchEthRPCError = response.fetchErrorBoolean;
      if (fetchEthRPCError)
        console.error(`Error while connecting to the ETHEREUM RPC ${CUSTOM_ETH_RPC_API_URL}. Double check the url in the connections tab.`);
    });
  }

  // Prometheus metric
  let peers = null;

  // General metrics
  let nodeHeight: number;
  let chainHeight;
  let gasPrice;
  let syncingStatus;
  let syncingProgress = 0;
  let customAddress = getLocalStorageItem("customAddress");

  // TODO: remove 'any' types
  let Balance;
  let nodeType = NodeTypes.Node;

  if (getLocalStorageItem("nodeType")) {
    nodeType = getLocalStorageItem("nodeType");
  }

  let intervalTimer: NodeJS.Timer;
  let systeminformationMetrics: SysteminformationMetricsInterface = null;

  // layout variables
  let connectionsOpen: boolean = false;

  // fetch general metrics from the node RPCs
  async function fetchMetrics() {
    try {
      // Check if there was an error with the ETH RPC connection, before fetching data
      if (!fetchEthRPCError) {
        gasPrice = Number(
          // TODO: Use our own RPC when we are synced
          ethRPC?.utils.fromWei(await ethRPC?.eth.getGasPrice(), "gwei"),
        );

        if(customAddress){
          Balance = Number(
            ethRPC?.utils.fromWei(
              await ethRPC?.eth.getBalance(customAddress),
              "ether",
            ),
          ).toFixed(4);
        }
      } else {
        Balance = null;
        gasPrice = null;
      }

      // If there was an error with the Node, return and set the syncingStatus to null so the progress bar reads 'node not found'
      // This way there aren't made any more calls to offline RPC's before the connection is stable again
      if(fetchMyNodeError){
        syncingStatus = null;
        return;
      }

      nodeHeight = await myNode.eth.getBlockNumber();
      // set the startNodeHeight once
      if(startNodeHeight === undefined) startNodeHeight = nodeHeight;
      chainHeight = await ethRPC.eth.getBlockNumber();

      /*
        Workaround to fix the initial 5mins where the node displays as synced but it hasn't even started syncing yet
        check if there is a huge difference between myNode blocknumber and eth rpc blocknumber while it's showing as not syncing
      */
      if (
        chainHeight - nodeHeight > 100 &&
        (await myNode.eth.isSyncing()) === false
      ) {
        syncingStatus = undefined;
      } else {
        syncingStatus = await myNode.eth.isSyncing();
      }
      if (syncingStatus !== undefined && syncingStatus !== null) {
        syncingProgress =
          (syncingStatus.currentBlock / syncingStatus.highestBlock) * 100;
      }

      // Estimate how long until node is synced, but only if the nodeheight is more than 100 blocks behind the chainHeight
      if (chainHeight - nodeHeight > 100) {
        currentNodeheight = nodeHeight;
        currentTime = Date.now();
        const blocksDownloaded = Number(nodeHeight) - Number(startNodeHeight);
        const blocksRemaining = Number(chainHeight) - Number(startNodeHeight);
        const downloadProgress = blocksDownloaded / blocksRemaining;

        //only calculate after 5s and when the downloadProgress is bigger than 0, to be more accurate
        const timeElapsed = currentTime - startTime;
        if (timeElapsed > 5000 && downloadProgress > 0) {
          const estimatedTotalTime = timeElapsed / downloadProgress;
          estimatedSyncingTime = simpleDuration.stringify(
            estimatedTotalTime / 1000,
            "m",
          );
        }
      }
    } catch (error) {
      console.error("Error while fetching RPC metrics", error);
      syncingStatus = null;
    }
  }

  // fetch from the nodejs api that exposes system metrics using the npm package systeminformation
  async function fetchSystemInfo() {
    try {
      const response = await fetch(`${CUSTOM_SYSTEMINFO_API_URL}/metrics`);
      const systemInfo: Systeminfo = await response.json();

      const mem = systemInfo.mem;
      const disk = systemInfo.disk[0];
      const currentTime = Math.floor(Date.now() / 1000);
      const secondsElapsed = currentTime - systemInfo.startTime;
      const runtimeInHours = secondsElapsed / 3600;
      const runtime = runtimeInHours >= 1 ? runtimeInHours : runtimeInHours * 60;

      systeminformationMetrics = {
        memUsedGB: Number(((mem.total - mem.available) / 1024 / 1024 / 1024).toFixed(2)),
        memUsedPerc: Number((((mem.total - mem.available) / mem.total) * 100).toFixed(2)),
        cpuUsedPerc: Number(systemInfo.cpu.currentLoad.toFixed(2)),
        filestorageFreeGB: Number(((disk.size - disk.used) / 1024 / 1024 / 1024).toFixed(2)),
        filestorageUsedGB: Number((disk.used / 1024 / 1024 / 1024).toFixed(2)),
        filestorageUsedPerc: Number(disk.use.toFixed(2)),
        runtime: Number(runtime.toFixed(0)),
        runtimeMetricType: runtimeInHours >= 1 ? MetricTypes.hours : MetricTypes.minutes,
      };
      fetchSystemInfoError = false;
    } catch (error) {
      if (!fetchSystemInfoError) {
        console.error("Error while fetching systeminfo", error);
        fetchSystemInfoError = true;
      }
    }
  }

  // Fetch from prometheus
  const fetchPrometheus = async () => {
    try {
      const peersData = await queryPrometheus(
        CUSTOM_PROMETHEUS_API_URL,
        "p2p_peers",
      );

      // Check if we can find the p2p_peers value in the result, throw error if response is undefined
      if (peersData?.data?.result?.[0]?.value?.[1] === undefined)
        throw new Error("Value p2p_peers not found in the Prometheus response");

      peers = peersData.data.result[0].value[1];
      fetchPrometheusError = false;
    } catch (error) {
      peers = "";

      if (!fetchPrometheusError) {
        console.error("Error while fetching prometheus", error);
        fetchPrometheusError = true;
      }
    }
  };

  function handleNavigation() {
    if (selected === 'mainnet') {
      window.location.href = "http://dashboard.dojonode.xyz";
    } else if (selected === 'hekla') {
      window.location.href = "http://hekla.dojonode.xyz";
    }
  }

  // switching the nodetype reveals/hides certain cards
  function switchNodeType(type) {
    if (nodeType === type) return;

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
    // Initialize the RPC connections
    await initConnections();

    // Interval to fetch metrics every 30 seconds
    intervalTimer = setInterval(async () => {
      try {
        fetchMetrics();
        fetchSystemInfo();
        fetchPrometheus();

        // If there were errors connecting to node, we will occasionally re-try initializing the RPC connections
        if (fetchMyNodeError) initConnections();
      } catch (e) {
        console.error(e);
      }
    }, 30000);
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
          <img src={dojoScrollIcon} class="icon-big m-auto" alt="dojo flag">
        </span>
      </div>
    </section>

    <div class="nodeTypes flex justify-evenly mt-4">
      <button
        class:active={nodeType === NodeTypes.Node}
        on:click={() => switchNodeType(NodeTypes.Node)}>node</button
      >
      <span class="bar">|</span>
      <button
        class:active={nodeType === NodeTypes.Validator}
        on:click={() => switchNodeType(NodeTypes.Validator)}>validator</button
      >
    </div>
  </div>

  <!-- Progress Bar -->
  <!--
    the progress can only be displayed if the syncingrequest has been made and the node can be found
    -> first check if the request was made: !== undefined
    -> check if the node is found: !== null
    -> check if the node is syncing: syncingStatus === true

    use a -1 value to display the loading or node not found values
   -->
  <div class="my-4 text-center">
    <Progressbar
      progress={syncingStatus === undefined
        ? (Number(nodeHeight) / Number(chainHeight)) * 100
        : syncingStatus === null
        ? -1
        : syncingStatus
        ? syncingProgress
        : 100}
      precision={2}
      showPercentage={true}
      finishedMessage={syncingStatus === undefined
        ? "preparing to sync..."
        : syncingStatus === null
        ? "node not found"
        : "synced!"}
    />
    {#if estimatedSyncingTime && syncingStatus}
      <span class="text-[12px] text-[hsl(var(--twc-cardSubBodyColor))]"
        >{estimatedSyncingTime}</span
      >
    {/if}
  </div>

  <div
    class="max-w-[35rem] sticky sm:justify-center"
  >
    <button
      id="connectionsBtn"
      class="w-6 h-6 absolute right-[7px] mr-[6px] top-[-37px] cursor-pointer"
      on:click={() => (connectionsOpen = true)}
    >
      <img
        src={antennaIcon}
        class={hasError
          ? "animateConnections"
          : ""}
        alt="antenna icon"
      />
    </button>

    <div
      id="cards"
      class="mt-[1px] flex flex-wrap justify-center overflow-y-clip"
    >
    <!-- TODO: make this dynamic, try to fetch the information from the node? -->
      <ChainCard
        title="chain"
        body="ethereum"
        subBody="mainnet"
        icon={ethIcon}
      />
      <Card
        title="memory"
        body={systeminformationMetrics?.memUsedGB}
        bodyMetricType={MetricTypes.gigabyte}
        subBody={systeminformationMetrics?.memUsedPerc}
        subBodyMetricType={MetricTypes.percentage}
        icon={brainIcon}
        loadingbar={true}
        progress={systeminformationMetrics?.memUsedPerc}
      />
      <Card
        title="cpu"
        body={systeminformationMetrics?.cpuUsedPerc}
        bodyMetricType={MetricTypes.percentage}
        icon={heartIcon}
        loadingbar={true}
        progress={systeminformationMetrics?.cpuUsedPerc}
      />
      <Card
        title="storage"
        body={systeminformationMetrics?.filestorageUsedGB}
        bodyMetricType={MetricTypes.gigabyte}
        subBody={systeminformationMetrics?.filestorageUsedPerc}
        subBodyMetricType={MetricTypes.percentage}
        icon={fileboxIcon}
        loadingbar={true}
        progress={systeminformationMetrics?.filestorageUsedPerc}
      />
      <Card
        title="nodeheight"
        body={nodeHeight}
        bodyMetricType={MetricTypes.blockheight}
        subBody={chainHeight}
        subBodyMetricType={MetricTypes.blockheight}
        icon={chainIcon}
        loadingbar={false}
      />
      <Card
        title="peers"
        body={peers}
        bodyMetricType={MetricTypes.peers}
        icon={dollsIcon}
        loadingbar={false}
      />
      <Card
        title="runtime"
        body={systeminformationMetrics?.runtime}
        bodyMetricType={systeminformationMetrics?.runtimeMetricType}
        icon={timerclockIcon}
        loadingbar={false}
      />
      <Card
        title="gas"
        body={gasPrice}
        bodyMetricType={MetricTypes.gas}
        icon={gasIcon}
        loadingbar={false}
      />
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
    <div
      class="connections grid grid-cols-1 gap-6 mx-5 my-10 max-h-96 overflow-y-auto text-[hsl(var(--twc-textColor))]"
      slot="body"
    >
      <div
        class="flex sm:flex-row flex-col justify-between items-center font-bold"
      >
        ethereum address
        <div class="ml-2 w-72 flex items-center">
          <input
              class="shadow appearance-none rounded w-full py-2 px-3 focus:outline-none focus:shadow-outline leading-none"
              type="text"
              bind:value={customAddress}
              on:keyup={() => {
                setLocalStorageItem("customAddress", customAddress.trim());
              }}
            />
        </div>
      </div>
      <div
        class="flex sm:flex-row flex-col justify-between items-center font-bold"
      >
        node
        <div class="ml-2 w-72 flex items-center">
          <input
            class="shadow appearance-none rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline mt-1"
            type="text"
            bind:value={CUSTOM_MYNODE_API_URL}
            placeholder={MYNODE_API_URL}
            on:change={() => {
              setLocalStorageItem(
                "CUSTOM_MYNODE_API_URL",
                CUSTOM_MYNODE_API_URL,
              );
              initConnections();
            }}
          />
          <img
            src={fetchMyNodeError ? warningIcon : checkmarkIcon}
            alt="icon"
            class="w-[30px] ml-2"
          />
        </div>
      </div>
      <div
        class="flex sm:flex-row flex-col justify-between items-center font-bold"
      >
        systeminformation
        <div class="ml-2 w-72 flex items-center">
          <input
            class="shadow appearance-none rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            bind:value={CUSTOM_SYSTEMINFO_API_URL}
            placeholder={SYSTEMINFO_API_URL}
            on:change={() => {
              setLocalStorageItem(
                "CUSTOM_SYSTEMINFO_API_URL",
                CUSTOM_SYSTEMINFO_API_URL,
              );
            }}
          />
          <img
            src={fetchSystemInfoError ? warningIcon : checkmarkIcon}
            alt="icon"
            class="w-[30px] ml-2"
          />
        </div>
      </div>
      <div
        class="flex sm:flex-row flex-col justify-between items-center font-bold"
      >
        prometheus
        <div class="ml-2 w-72 flex items-center">
          <input
            class="shadow appearance-none rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            bind:value={CUSTOM_PROMETHEUS_API_URL}
            placeholder={PROMETHEUS_API_URL}
            on:change={() => {
              setLocalStorageItem(
                "CUSTOM_PROMETHEUS_API_URL",
                CUSTOM_PROMETHEUS_API_URL,
              );
            }}
          />
          <img
            src={fetchPrometheusError ? warningIcon : checkmarkIcon}
            alt="icon"
            class="w-[30px] ml-2"
          />
        </div>
      </div>
      <div
        class="flex sm:flex-row flex-col justify-between items-center font-bold"
      >
        ethereum RPC
        <div class="ml-2 w-72 flex items-center">
          <input
            class="shadow appearance-none rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline mb-1"
            type="text"
            bind:value={CUSTOM_ETH_RPC_API_URL}
            placeholder={ETH_RPC_API_URL}
            on:change={() => {
              setLocalStorageItem(
                "CUSTOM_ETH_RPC_API_URL",
                CUSTOM_ETH_RPC_API_URL,
              );
              initConnections();
            }}
          />
          <img
            src={fetchEthRPCError ? warningIcon : checkmarkIcon}
            alt="icon"
            class="w-[30px] ml-2"
          />
        </div>
      </div>
    </div>
  </DetailsModal>
{/if}

<style>
  .nodeTypes {
    color: hsl(var(--twc-textColor));
    font-weight: 400;
    z-index: 1;
    position: relative;
    width: 200px;
    margin-left: auto;
    margin-right: auto;
  }

  .nodeTypes .active {
    color: hsl(var(--twc-nodeTypesColorActive));
    font-weight: 600;
  }

  .nodeTypes .bar {
    margin-top: auto;
    margin-bottom: auto;
    color: hsl(var(--twc-textColor));
    font-weight: 400;
  }

  .connections input {
    background-color: hsl(var(--twc-inputAccentColor));
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
    color: hsl(var(--twc-textColor));
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

  #networkDropdown{
    color: hsl(var(--twc-textColor));
    background-color: hsl(var(--twc-cardBackgroundColor));
  }
</style>
