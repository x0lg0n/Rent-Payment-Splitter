export interface TransactionRecord {
  id: string;
  hash: string;
  from: string;
  to: string;
  amount: string;
  network: "testnet";
  createdAt: string;
  confirmed?: boolean;
  ledger?: number;
}
