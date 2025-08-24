import {
  createPublicClient,
  createWalletClient,
  http,
  PublicClient,
  WalletClient,
} from "viem";
import express from "express";
import si from "systeminformation";
import cors from "cors";
import { getChainInfo } from "./utils/chain";
import { GeneralMetricsResponse, NetworkSync, Config } from "./utils/types";
import { readConfig, writeConfig } from "./utils/helpers.ts";
const app = express();
const port = 3009;

const startTime = Date.now(); // Start new timer on startup, to keep track of runtime
let startingBlock: number;

let config: Config = await readConfig();

let client: PublicClient; // connected to the node for general metrics
let walletClient: WalletClient; // connected to the node and fetch syncing status
let publicNodeClient: PublicClient; // publicNodeClient is connected to a public RPC

let nodeError: Boolean;
let publicNodeError: Boolean;

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

async function initNodeClients() {
  try {
    client = createPublicClient({
      transport: http(config.NODE_API_URL, {timeout: 5_000}),
    });

    walletClient = createWalletClient({
      transport: http(config.NODE_API_URL, {timeout: 5_000}),
    });

    // Check if client is reachable
    await client.request({
      method: "net_listening",
    });

    nodeError = false;
  } catch (error) {
    nodeError = true;
  }
}

async function initPublicNodeClient(url) {
  try {
    publicNodeClient = createPublicClient({
      transport: http(url),
    });

    // Check if publicNodeClient is reachable (don't use net_listening since the net package isn't usually available in public RPC's)
    await publicNodeClient.request({
      method: "eth_blockNumber",
    });

    publicNodeError = false;
  } catch (error) {
    publicNodeError = true;
  }
}

app.get("/connections", async (_req, res) => {
  const connections = {
    node: config.NODE_API_URL,
    nodeError: nodeError,
  };
  console.log("get connections:", connections);
  res.json(connections);
});

app.post("/connections", async (req, res) => {
  const { node } = req.body;

  config.NODE_API_URL = node;

  await writeConfig(config);
  await initNodeClients();

  console.log("post connections:", config);
  res.json({ nodeError });
});

app.get("/systemMetrics", async (_req, res) => {
  const mem = await si.mem();
  const cpu = await si.currentLoad();
  const disk = await si.fsSize();

  const metrics = {
    mem,
    cpu,
    disk,
    startTime,
  };

  res.json(metrics);
});

app.get("/generalMetrics", async (_req, res) => {
  const response: GeneralMetricsResponse = {
    gasPrice: null,
    peers: null,
    nodeHeight: null,
    chainHeight: null,
    syncingState: null,
    chainId: null,
    estimatedSyncingTimeInSeconds: null,
    nodeError: false,
  };

  try {
    response.chainId = Number(
      await client.request({
        method: "eth_chainId",
      })
    );

    // Note that some nodes will have net_peerCount not open (net)
    response.peers = Number(
      await client.request({
        method: "net_peerCount",
      })
    );

    const currentBlock = await client.getBlockNumber();

    response.gasPrice = (await client.getGasPrice()).toString();

    const syncingStatus: NetworkSync | false = await walletClient.request({
      method: "eth_syncing",
    });

    if (syncingStatus === false) {
      response.syncingState = "synced";
      response.nodeHeight = currentBlock.toString();
      response.chainHeight = currentBlock.toString();
    } else {
      /*
      Node is syncing:

      currentBlock - number of the most-recent block synced
      highestBlock - number of latest block on the network
      startingBlock - block number at which syncing started

    */
      response.syncingState = "syncing";
      response.nodeHeight = Number(syncingStatus.currentBlock).toString();
      response.chainHeight = Number(syncingStatus.highestBlock).toString();

      // While the node is syncing, the chainheight and gasPrice from the node is not reliable, so we use a public RPC as a fallback
      if (publicNodeClient === undefined) {
        const publicClientApi = getChainInfo(response.chainId).rpc;
        await initPublicNodeClient(publicClientApi);
      }

      // Check if we were able to connect to the public node
      if (!publicNodeError) {
        response.chainHeight = Number(
          await publicNodeClient.getBlockNumber()
        ).toString();

        // Fetch gas from public node since it is not reliable during syncing
        response.gasPrice = (await publicNodeClient.getGasPrice()).toString();
      }

      // Estimate syncing time
      if (startingBlock === undefined)
        startingBlock = Number(syncingStatus.currentBlock); // set the startBlock ourselves to be more accurate

      const currentBlock = Number(syncingStatus.currentBlock);
      const blocksDownloaded = currentBlock - startingBlock;
      const blocksRemaining = Number(response.chainHeight) - currentBlock;
      const timeElapsed = Date.now() - startTime;
      const avgBlocksPerSecond = blocksDownloaded / (timeElapsed / 1000);

      response.estimatedSyncingTimeInSeconds =
        blocksRemaining / avgBlocksPerSecond;
    }
  } catch (error) {
    response.nodeError = true;
  }

  res.json(response);
});

app.listen(port, () => {
  console.log(`dojonode API listening at http://localhost:${port}`);
  initNodeClients();
});
