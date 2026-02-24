interface FreighterApi {
  requestAccess?: () => Promise<unknown>;
  getAddress?: () => Promise<unknown>;
  getPublicKey?: () => Promise<unknown>;
  getNetwork?: () => Promise<unknown>;
  isConnected?: () => Promise<boolean | { isConnected?: boolean }>;
}

interface Window {
  freighterApi?: FreighterApi;
}
