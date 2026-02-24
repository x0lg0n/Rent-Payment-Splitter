import {
  getAddress,
  getNetwork,
  isConnected,
  requestAccess,
  signTransaction,
  setAllowed,
} from "@stellar/freighter-api";

interface FreighterApiErrorShape {
  code?: number;
  message?: string;
}

const isSecureLocalDev = () => {
  if (typeof window === "undefined") return false;
  return (
    window.isSecureContext ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
};

const toErrorMessage = (
  error?: FreighterApiErrorShape,
  fallback = "Wallet request failed.",
) => {
  if (!error) return fallback;
  if (error.message && error.message.trim().length > 0) return error.message;
  return fallback;
};

const extensionNotDetectedMessage =
  "Freighter extension not detected for this page. Use localhost/HTTPS and enable site access for this URL in the extension settings.";

const ensureEnvironment = () => {
  if (typeof window === "undefined") {
    throw new Error("Wallet connection is only available in the browser.");
  }
  if (!isSecureLocalDev()) {
    throw new Error(
      "Wallet requires a secure context. Run on localhost or HTTPS.",
    );
  }
};

export interface FreighterSession {
  address: string;
  network: string | null;
}

export const connectFreighter = async (): Promise<FreighterSession> => {
  ensureEnvironment();

  const connection = await isConnected();
  if (connection.error) {
    throw new Error(toErrorMessage(connection.error, extensionNotDetectedMessage));
  }
  if (!connection.isConnected) {
    throw new Error(extensionNotDetectedMessage);
  }

  const allowed = await setAllowed();
  if (allowed.error) {
    throw new Error(
      toErrorMessage(
        allowed.error,
        "Unable to authorize this site in Freighter. Check extension permissions.",
      ),
    );
  }

  const access = await requestAccess();
  if (access.error) {
    throw new Error(
      toErrorMessage(access.error, "Wallet access request was rejected."),
    );
  }

  const addressResponse = await getAddress();
  if (addressResponse.error || !addressResponse.address) {
    throw new Error(
      toErrorMessage(addressResponse.error, "Unable to read wallet address."),
    );
  }

  const networkResponse = await getNetwork();
  if (networkResponse.error) {
    throw new Error(
      toErrorMessage(networkResponse.error, "Unable to read wallet network."),
    );
  }

  return {
    address: addressResponse.address,
    network: networkResponse.networkPassphrase || networkResponse.network || null,
  };
};

export const getFreighterSession = async (): Promise<FreighterSession | null> => {
  if (typeof window === "undefined") return null;
  if (!isSecureLocalDev()) return null;

  const connection = await isConnected();
  if (!connection.isConnected || connection.error) {
    return null;
  }

  const addressResponse = await getAddress();
  if (addressResponse.error || !addressResponse.address) {
    return null;
  }

  const networkResponse = await getNetwork();

  return {
    address: addressResponse.address,
    network:
      networkResponse.error || !networkResponse
        ? null
        : networkResponse.networkPassphrase || networkResponse.network || null,
  };
};

export const signWithFreighter = async (
  transactionXdr: string,
  networkPassphrase: string,
  address: string,
) => {
  const response = await signTransaction(transactionXdr, {
    networkPassphrase,
    address,
  });

  if (response.error || !response.signedTxXdr) {
    throw new Error(
      toErrorMessage(response.error, "Wallet declined transaction signing."),
    );
  }

  return response.signedTxXdr;
};
