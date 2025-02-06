const express = require("express");
const si = require("systeminformation");
const cors = require("cors");
const app = express();
const port = 3009;

// Start new timer on startup, to keep track of runtime
const startTime = Math.floor(new Date() / 1000);

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
  res.json({
    gasPrice: 5,
    peers: 10,
    nodeHeight: 1100,
    chainHeight: 1200,
    syncingState: "error", // TODO: use enum, union or whatever works best succes/syncing/error
  });
});

app.listen(port, () => {
  console.log(`Metrics API listening at http://localhost:${port}/metrics`);
});
