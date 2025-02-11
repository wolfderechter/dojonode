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

// TODO: Send request to the node
app.get("/generalMetrics", async (req, res) => {
  const peersData = await queryPrometheus("p2p_peers");
  const peers = peersData?.data?.result?.[0]?.value?.[1] ?? null;

  res.json({
    gasPrice: 5,
    peers: peers,
    nodeHeight: 1100,
    chainHeight: 1200,
    syncingState: "error", // TODO: use enum, union or whatever works best succes/syncing/error
  });
});

app.listen(port, () => {
  console.log(`dojonode API listening at http://localhost:${port}`);
});

async function queryPrometheus(query) {
  try {
    const response = await fetch(
      PROMETHEUS_API_URL + `/api/v1/query?query=${query}`
    );

    if (!response.ok) {
      console.error(`Prometheus API error: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error querying Prometheus: ${error.message}`);
  }
}
