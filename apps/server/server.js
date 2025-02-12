import { createPublicClient, http } from "viem";
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

const client = createPublicClient({
  // chain: mainnet,
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

  const syncingStatus = await client.request({
    method: "eth_syncing",
  });

  if (syncingStatus === false) {
    response.syncingState = "synced";
    response.nodeHeight = currentBlock.toString();
    response.chainHeight = currentBlock.toString();
  } else {
    // Node is syncing...
    response.syncingState = "syncing";
    response.nodeHeight = Number(syncingStatus.currentBlock).toString();
    response.chainHeight = Number(syncingStatus.highestBlock).toString();
  }

  res.json(response);
});

app.listen(port, () => {
  console.log(`dojonode API listening at http://localhost:${port}`);
});
