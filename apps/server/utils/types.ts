export type SyncState = "synced" | "syncing" | "error" | null;

export interface GeneralMetricsResponse {
  gasPrice: string | null;
  peers: number | null;
  nodeHeight: string | null;
  chainHeight: string | null;
  syncingState: SyncState;
  chainId: number | null;
  estimatedSyncingTimeInSeconds: number | null;
  nodeError: boolean | null;
}

export interface NetworkSync {
  currentBlock: string;
  highestBlock: string;
  startingBlock: string;
}

export interface Config {
  NODE_API_URL: string;
}
