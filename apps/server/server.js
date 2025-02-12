import { createPublicClient, createWalletClient, http } from "viem";
const express = require("express");
const si = require("systeminformation");
const cors = require("cors");
const app = express();
const port = 3009;

const PROMETHEUS_API_URL = "http://localhost:9090";
const MYNODE_API_URL = "http://localhost:8545";
const ETH_RPC_API_URL = "https://ethereum-rpc.publicnode.com";

// Start new timer on startup, to keep track of runtime
const startTime = Date.now();

const publicClient = createPublicClient({
  transport: http(MYNODE_API_URL),
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

app.get("/generalMetrics", async (req, res) => {
  const response = {
    gasPrice: null,
    peers: null,
    nodeHeight: null,
    chainHeight: null,
    syncingState: null,
    chainId: null,
  };

  const chainId = await publicClient.request({
    method: "eth_chainId",
  });
  response.chainId = Number(chainId);

  const peers = await publicClient.request({
    method: "net_peerCount",
  });
  response.peers = Number(peers);

  const currentBlock = await publicClient.getBlockNumber();

  const gasPrice = await publicClient.getGasPrice();
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
    response.chainHeight = Number(syncingStatus.currentBlock).toString();
    response.nodeHeight = Number(syncingStatus.highestBlock).toString();
  }

  res.json(response);
});

app.listen(port, () => {
  console.log(`dojonode API listening at http://localhost:${port}`);
});
