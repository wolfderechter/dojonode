export type SyncState = "synced" | "syncing" | "error" | null;

export interface GeneralMetricsResponse {
  gasPrice: string | null;
  peers: number | null;
  nodeHeight: string | null;
  chainHeight: string | null;
  syncingState: SyncState;
  chainId: number | null;
  estimatedSyncingTimeInSeconds: number | null;
}

export interface NetworkSync {
  currentBlock: string;
  highestBlock: string;
  startingBlock: string;
}
