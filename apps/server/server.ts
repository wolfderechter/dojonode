import { createPublicClient, createWalletClient, http } from "viem";
import express from "express";
import si from "systeminformation";
import cors from "cors";

const app = express();
const port = 3009;

interface GeneralMetricsResponse {
  gasPrice: string | null;
  peers: number | null;
  nodeHeight: string | null;
  chainHeight: string | null;
  syncingState: SyncState;
  chainId: number | null;
  estimatedSyncingTimeInSeconds: number | null;
}

type SyncState = "synced" | "syncing" | "error" | null;

interface NetworkSync {
  currentBlock: string;
  highestBlock: string;
  startingBlock: string;
}

const MYNODE_API_URL = "http://100.95.151.102:8545";

// Start new timer on startup, to keep track of runtime
const startTime = Date.now();

// Client is connected to the node
const client = createPublicClient({
  transport: http(MYNODE_API_URL),
});
// publicClient is connected to a public RPC
const publicClient = createPublicClient({
  transport: http("https://gnosis-rpc.publicnode.com"),
});

const walletClient = createWalletClient({
  transport: http(MYNODE_API_URL),
});

app.use(
  cors({
    origin: "*",
  })
);

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
  };

  const chainId = await client.request({
    method: "eth_chainId",
  });
  response.chainId = Number(chainId);

  const peers = await client.request({
    method: "net_peerCount",
  });
  response.peers = Number(peers);

  const currentBlock = await client.getBlockNumber();

  const gasPrice = await client.getGasPrice();
  response.gasPrice = gasPrice?.toString();

  const syncingStatus: NetworkSync | false = await walletClient.request({
    method: "eth_syncing",
  });

  if (syncingStatus === false) {
    response.syncingState = "synced";
    response.nodeHeight = currentBlock.toString();
    response.chainHeight = currentBlock.toString();
  } else {
    // Node is syncing...
    response.syncingState = "syncing";
    // While the node is syncing, the chainheight from the node is not reliable, and we have to use public RPC as a fallback
    response.chainHeight = Number(
      await publicClient.getBlockNumber()
    ).toString();
    response.nodeHeight = Number(syncingStatus.highestBlock).toString();

    // Estimate syncing time
    const blocksDownloaded =
      Number(syncingStatus.currentBlock) - Number(syncingStatus.startingBlock);
    const blocksRemaining =
      Number(syncingStatus.currentBlock) - Number(syncingStatus.highestBlock);
    const downloadProgress = blocksDownloaded / blocksRemaining;
    const timeElapsed = Date.now() - startTime;
    response.estimatedSyncingTimeInSeconds =
      timeElapsed / downloadProgress / 1000;
  }

  res.json(response);
});

app.listen(port, () => {
  console.log(`dojonode API listening at http://localhost:${port}`);
});
