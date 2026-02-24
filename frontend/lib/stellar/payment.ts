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

export const isValidStellarAddress = (address: string) =>
  StrKey.isValidEd25519PublicKey(address);

export const isValidXlmAmount = (amount: string) => {
  if (!AMOUNT_PATTERN.test(amount)) return false;
  const parsed = Number(amount);
  return Number.isFinite(parsed) && parsed > 0;
};

const extractHorizonError = (error: unknown) => {
  const fallback = "Transaction failed on Stellar testnet.";
  if (!(error instanceof Error)) return fallback;

  const payload = error as Error & {
    response?: { data?: { extras?: { result_codes?: Record<string, string> } } };
  };

  const resultCodes = payload.response?.data?.extras?.result_codes;
  if (resultCodes) {
    const op = resultCodes.operations?.toString() ?? "";
    const tx = resultCodes.transaction?.toString() ?? "";

    if (op.includes("op_underfunded")) {
      return "Insufficient XLM balance for this payment.";
    }
    if (op.includes("op_no_destination")) {
      return "Recipient account does not exist on testnet.";
    }
    if (tx.includes("tx_bad_seq")) {
      return "Sequence mismatch. Please retry the transaction.";
    }
  }

  return error.message || fallback;
};

interface SendXlmPaymentInput {
  sourceAddress: string;
  destinationAddress: string;
  amount: string;
}

export const sendTestnetXlmPayment = async ({
  sourceAddress,
  destinationAddress,
  amount,
}: SendXlmPaymentInput) => {
  if (!isValidStellarAddress(sourceAddress)) {
    throw new Error("Connected wallet address is invalid.");
  }
  if (!isValidStellarAddress(destinationAddress)) {
    throw new Error("Recipient address is invalid.");
  }
  if (!isValidXlmAmount(amount)) {
    throw new Error("Amount must be a valid positive XLM value.");
  }

  try {
    const sourceAccount = await server.loadAccount(sourceAddress);
    const baseFee = await server.fetchBaseFee();

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
      .setTimeout(30)
      .build();

    const signedXdr = await signWithFreighter(
      transaction.toXDR(),
      STELLAR_TESTNET_PASSPHRASE,
      sourceAddress,
    );

    const signedTransaction = TransactionBuilder.fromXDR(
      signedXdr,
      Networks.TESTNET,
    );

    const result = await server.submitTransaction(signedTransaction);
    return result.hash;
  } catch (error) {
    throw new Error(extractHorizonError(error));
  }
};
