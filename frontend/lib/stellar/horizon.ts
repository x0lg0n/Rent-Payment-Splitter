import { Horizon } from "@stellar/stellar-sdk";
import { HORIZON_TESTNET_URL } from "@/lib/stellar/network";

const server = new Horizon.Server(HORIZON_TESTNET_URL);

/**
 * Fetch XLM balance with abort support
 */
export const fetchTestnetXlmBalance = async (
  address: string,
  abortSignal?: AbortSignal
) => {
  const account = await server.loadAccount(address);
  const nativeBalance = account.balances.find(
    (balance) => balance.asset_type === "native"
  );
  return nativeBalance ? Number(nativeBalance.balance) : 0;
};

/**
 * Fetch account details with abort support
 */
export const fetchAccountDetails = async (
  address: string,
  abortSignal?: AbortSignal
) => {
  try {
    const account = await server.loadAccount(address);
    return {
      address: account.account_id,
      sequence: account.sequence,
      subentryCount: account.subentry_count,
      lastModifiedLedger: account.last_modified_ledger,
      balances: account.balances.map((b) => ({
        balance: b.balance,
        assetType: b.asset_type,
        assetCode: b.asset_code,
        assetIssuer: b.asset_issuer,
      })),
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      throw new Error(`Account ${address} not found on Stellar testnet`);
    }
    throw error;
  }
};

/**
 * Fetch transaction history with pagination
 */
export const fetchTransactionHistory = async (
  address: string,
  limit: number = 20,
  cursor?: string,
  abortSignal?: AbortSignal
) => {
  let query = server.transactions().forAccount(address).order("desc").limit(limit);
  
  if (cursor) {
    query = query.cursor(cursor);
  }
  
  const transactions = await query.call();
  
  return {
    records: transactions.records.map((tx) => ({
      hash: tx.hash,
      ledger: tx.ledger_attr,
      createdAt: tx.created_at,
      successful: tx.successful,
      operationCount: tx.operation_count,
      feeBump: tx.fee_bump_transaction,
    })),
    nextCursor: transactions.next_cursor,
    hasMore: !!transactions.next_cursor,
  };
};

export { server };
