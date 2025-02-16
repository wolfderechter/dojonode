# dojonode

Fork of [dojonode/taiko-node-dashboard](https://github.com/dojonode/taiko-node-dashboard).

WIP but the goal is to have an easy dashboard option for ethereum/gnosis nodes.

## Version 2 Changes

- Major refactoring
- Moved to use a monorepo setup
- Removed prometheus dependency (directly fetch amount of peers from the node)
    - Reduces the setup required
- All API requests to the node are now made in the backend
    - No browser limitations
- Use Viem instead of web3.js since it's getting deprecated
- Bump to latest versions: Svelte 5, Vite 6, Tailwind v4
- Compatible with any node
    - Ethereum, Gnosis
    - Layer 2 nodes (Taiko, ...)

## Setup

Dojonode needs to access the execution client API (usually on port 8545) to show certain metrics, so if this is not accessible make sure dojonode can reach it.

### Basic Installation

1. `git clone https://github.com/wolfderechter/dojonode`
2. `cd dojonode`
3. `docker compose up -d`
4. Visit the frontend on `http://localhost:7744`
5. With the '📡' icon, you can open the connections tab. Change this to the IP address where dojonode is running.

### Network Configuration

There are two ways to connect dojonode to your execution client:

#### Option 1: Direct Connection

If your execution client's API (usually port 8545) is accessible, dojonode can connect to it directly.

#### Option 2: Docker Network

For better security, you can add dojonode to the same Docker network as your node instead of exposing ports to the host machine. Here's how:

1. First, define your execution client with a network (example using Erigon with the builtin caplin consensus client):

```docker
services:
  erigon:
    container_name: erigon
    image: erigontech/erigon:v3.0.0-beta1
    restart: unless-stopped
    volumes:
      - /home/$USER/gnosis/execution:/home/erigon/.local/share/erigon
      - /home/$USER/gnosis/jwtsecret/jwt.hex:/jwt:ro
    networks:
      - node_network
    ports:
      - 30303:30303
      - 30303:30303/udp
      - 30304:30304
      - 30304:30304/udp
      - 42069:42069
      - 42069:42069/udp
      - 4000:4000/udp
      - 4001:4001
    expose:
      - 8545
      - 8551
    command: |
      --chain=mainnet
      --http
      --http.api=eth,debug,net,trace,web3,erigon
      --http.addr=0.0.0.0
      --http.corsdomain=*
      --ws
      --metrics
      --metrics.addr=0.0.0.0
      --metrics.port=6060
      --pprof
      --pprof.addr=0.0.0.0
      --pprof.port=6070
      --authrpc.addr=0.0.0.0
      --authrpc.vhosts=*
      --prune.mode=minimal
      --torrent.download.rate=1mb
      --torrent.upload.rate=50mb
      --authrpc.jwtsecret=/jwt

networks:
  node_network:
    name: node_network
```

Here erigon uses `expose` to expose 8545 to other containers in the docker network, but not to the host machine. So if we add dojonode to the docker network, the dashboard can reach the node. Adding dojonode to the network is as simple as editing the `docker-compose.yml` file and adding the `node_network` or whatever network name you have:

```docker
services:
  client:
    image: wolfderechter/dojonode-client:latest
    ports:
      - "7744:80"
  server:
    image: wolfderechter/dojonode-server:latest
    ports:
      - "3009:3009"
    networks:
      - node_network


```
