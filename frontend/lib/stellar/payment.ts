import {
  Asset,
  Horizon,
  Networks,
  Operation,
  StrKey,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { HORIZON_TESTNET_URL, STELLAR_TESTNET_PASSPHRASE } from "@/lib/stellar/network";
import { signWithFreighter } from "@/lib/wallet/freighter";

const server = new Horizon.Server(HORIZON_TESTNET_URL);

const AMOUNT_PATTERN = /^(?:0|[1-9]\d*)(?:\.\d{1,7})?$/;

// Maximum amount check (prevent accidental large transfers)
const MAX_SINGLE_PAYMENT = 10000; // 10,000 XLM
// Minimum amount check (dust prevention + minimum balance)
const MIN_SINGLE_PAYMENT = 0.0000001; // 1 stroop
// Minimum balance to maintain (Stellar requirement)
const MIN_ACCOUNT_BALANCE = 1; // 1 XLM reserve

export const isValidStellarAddress = (address: string): boolean => {
  if (!address || typeof address !== "string") return false;
  if (!StrKey.isValidEd25519PublicKey(address)) return false;
  return true;
};

export const isValidXlmAmount = (amount: string): boolean => {
  if (!AMOUNT_PATTERN.test(amount)) return false;
  const parsed = Number(amount);
  if (!Number.isFinite(parsed) || parsed <= 0) return false;
  
  // Check against min/max limits
  if (parsed < MIN_SINGLE_PAYMENT) return false;
  if (parsed > MAX_SINGLE_PAYMENT) return false;
  
  return true;
};

/**
 * Check if account exists on Stellar network
 */
export const checkAccountExists = async (address: string): Promise<boolean> => {
  try {
    await server.loadAccount(address);
    return true;
  } catch (error) {
    if (error?.response?.status === 404) {
      return false;
    }
    // For other errors, assume exists to be safe
    return true;
  }
};

/**
 * Validate amount against balance including fees
 */
export const validateAmountAgainstBalance = (
  amount: string,
  balance: number | null
): { valid: boolean; error?: string } => {
  if (!balance || balance <= 0) {
    return { valid: false, error: "Unable to fetch balance" };
  }
  
  const paymentAmount = Number(amount);
  const baseFee = 100; // 100 stroops = 0.00001 XLM per operation
  const estimatedFee = baseFee * 2; // Account for potential additional operations
  
  const totalRequired = paymentAmount + (estimatedFee / 1e7);
  
  if (totalRequired > balance) {
    return { 
      valid: false, 
      error: `Insufficient balance. Need ${totalRequired.toFixed(7)} XLM (including fees), have ${balance.toFixed(7)} XLM` 
    };
  }
  
  // Check if payment would leave account below minimum balance
  const remainingBalance = balance - paymentAmount;
  if (remainingBalance < MIN_ACCOUNT_BALANCE && paymentAmount < balance) {
    return {
      valid: false,
      error: `Payment would leave account below minimum reserve (${MIN_ACCOUNT_BALANCE} XLM)`
    };
  }
  
  return { valid: true };
};

const extractHorizonError = (error: unknown) => {
  const fallback = "Transaction failed on Stellar testnet.";
  if (!(error instanceof Error)) return fallback;

  const payload = error as Error & {
    response?: { 
      data?: { 
        extras?: { 
          result_codes?: {
            operations?: string[];
            transaction?: string;
          };
          envelopeXdr?: string;
        };
        status?: number;
      };
    };
  };

  const resultCodes = payload.response?.data?.extras?.result_codes;
  if (resultCodes) {
    const op = resultCodes.operations?.[0] || "";
    const tx = resultCodes.transaction?.toString() || "";

    if (op.includes("op_underfunded")) {
      return "Insufficient XLM balance for this payment.";
    }
    if (op.includes("op_no_destination")) {
      return "Recipient account does not exist on testnet. They need to receive at least 1 XLM to activate.";
    }
    if (op.includes("op_low_reserve")) {
      return "Payment amount too small. Recipient needs minimum 1 XLM to maintain account.";
    }
    if (tx.includes("tx_bad_seq")) {
      return "Sequence mismatch. Please wait a moment and try again.";
    }
    if (tx.includes("tx_insufficient_fee")) {
      return "Transaction fee too low. Please try again.";
    }
    if (tx.includes("tx_too_late")) {
      return "Transaction expired. Please try again.";
    }
  }

  // Don't expose internal error details to users
  console.error("Payment error:", error);
  return error.message || fallback;
};

interface SendXlmPaymentInput {
  sourceAddress: string;
  destinationAddress: string;
  amount: string;
}

interface SendXlmPaymentResult {
  hash: string;
  confirmed: boolean;
  ledger?: number;
}

/**
 * Wait for transaction confirmation on Stellar
 * Timeout after 60 seconds
 * Uses Horizon API since SorobanRpc may not be available in all SDK versions
 */
export const waitForTransactionConfirmation = async (
  txHash: string,
  timeoutMs: number = 60000
): Promise<{ confirmed: boolean; ledger?: number }> => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    try {
      // Use Horizon API to check transaction status
      const tx = await server.transactions().transaction(txHash).call();
      
      if (tx && tx.successful) {
        return { 
          confirmed: true, 
          ledger: tx.ledger_attr 
        };
      }
      
      // Check if transaction failed
      if (tx && !tx.successful) {
        return { 
          confirmed: false 
        };
      }
      
      // Transaction not found yet, wait and retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      // Transaction not found yet, continue polling
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Timeout reached
  throw new Error(`Transaction confirmation timeout after ${timeoutMs / 1000} seconds`);
};

export const sendTestnetXlmPayment = async ({
  sourceAddress,
  destinationAddress,
  amount,
}: SendXlmPaymentInput): Promise<SendXlmPaymentResult> => {
  // Validate addresses
  if (!isValidStellarAddress(sourceAddress)) {
    throw new Error("Connected wallet address is invalid.");
  }
  if (!isValidStellarAddress(destinationAddress)) {
    throw new Error("Recipient address is invalid.");
  }
  if (!isValidXlmAmount(amount)) {
    throw new Error("Amount must be a valid positive XLM value (max 10,000 XLM).");
  }
  
  // Check for self-send
  if (sourceAddress === destinationAddress) {
    throw new Error("Cannot send payment to yourself.");
  }

  try {
    // Fetch source account
    const sourceAccount = await server.loadAccount(sourceAddress);
    const baseFee = await server.fetchBaseFee();

    // Build transaction
    const transaction = new TransactionBuilder(sourceAccount, {
      fee: String(baseFee),
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: destinationAddress,
          asset: Asset.native(),
          amount,
        }),
      )
      .setTimeout(180) // 3 minutes to allow for confirmation wait
      .build();

    // Sign with Freighter
    const signedXdr = await signWithFreighter(
      transaction.toXDR(),
      STELLAR_TESTNET_PASSPHRASE,
      sourceAddress,
    );

    const signedTransaction = TransactionBuilder.fromXDR(
      signedXdr,
      Networks.TESTNET,
    );

    // Submit transaction
    const result = await server.submitTransaction(signedTransaction);
    const txHash = result.hash;
    
    // Wait for confirmation
    try {
      const confirmation = await waitForTransactionConfirmation(txHash);
      
      if (!confirmation.confirmed) {
        throw new Error("Transaction was submitted but failed on-chain");
      }
      
      return {
        hash: txHash,
        confirmed: true,
        ledger: confirmation.ledger
      };
    } catch (confirmError) {
      // Transaction was submitted but confirmation failed
      // Log but don't throw - user should check explorer
      console.warn("Transaction submitted but confirmation check failed:", confirmError);
      
      return {
        hash: txHash,
        confirmed: false
      };
    }
  } catch (error) {
    throw new Error(extractHorizonError(error));
  }
};

/**
 * Fetch recent transactions for an account
 */
export const fetchAccountTransactions = async (
  address: string,
  limit: number = 20
) => {
  try {
    const transactions = await server
      .transactions()
      .forAccount(address)
      .order("desc")
      .limit(limit)
      .call();
    
    return transactions.records.map(tx => ({
      hash: tx.hash,
      ledger: tx.ledger_attr,
      createdAt: tx.created_at,
      successful: tx.successful,
      operationCount: tx.operation_count,
    }));
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return [];
  }
};
