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
- Bump to latest versions: Svelte 5, Vite 6
- Compatible with any node
    - Ethereum, Gnosis
    - Layer 2 nodes (Taiko, ...)
