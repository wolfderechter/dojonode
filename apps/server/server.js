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

app.get("/metrics", async (_req, res) => {
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
app.get("/api/gasPrice", async (req, res) => {
  res.json("5");
});

app.listen(port, () => {
  console.log(`Metrics API listening at http://localhost:${port}/metrics`);
});
