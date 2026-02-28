import { type FormEvent, useId, useEffect, useState } from "react";
import { Loader2, SendHorizontal, CheckCircle2, XCircle, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { isValidStellarAddress, isValidXlmAmount } from "@/lib/stellar/payment";

interface PaymentFormCardProps {
  recipientAddress: string;
  amount: string;
  canSubmit: boolean;
  isSending: boolean;
  onRecipientChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  walletBalance?: number | null;
}

const QUICK_AMOUNTS = [10, 25, 50, 100, 250, 500];

export function PaymentFormCard({
  recipientAddress,
  amount,
  canSubmit,
  isSending,
  onRecipientChange,
  onAmountChange,
  onSubmit,
  walletBalance,
}: PaymentFormCardProps) {
  const recipientId = useId();
  const amountId = useId();
  
  const [recipientError, setRecipientError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [isCheckingRecipient, setIsCheckingRecipient] = useState(false);

  // Validate recipient address in real-time
  useEffect(() => {
    if (!recipientAddress.trim()) {
      setRecipientError(null);
      setIsCheckingRecipient(false);
      return;
    }

    setIsCheckingRecipient(true);
    const timeoutId = setTimeout(() => {
      const cleanAddress = recipientAddress.trim();
      
      if (!isValidStellarAddress(cleanAddress)) {
        setRecipientError("Invalid Stellar address (must start with G and be 56 characters)");
      } else {
        setRecipientError(null);
      }
      
      setIsCheckingRecipient(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [recipientAddress]);

  // Validate amount in real-time
  useEffect(() => {
    if (!amount.trim()) {
      setAmountError(null);
      return;
    }

    const cleanAmount = amount.trim();
    
    if (!isValidXlmAmount(cleanAmount)) {
      setAmountError("Amount must be between 0.0000001 and 10,000 XLM");
    } else if (walletBalance && Number(cleanAmount) > walletBalance) {
      setAmountError(`Insufficient balance. You have ${walletBalance.toFixed(2)} XLM`);
    } else {
      setAmountError(null);
    }
  }, [amount, walletBalance]);

  const handleQuickAmount = (quickAmount: number) => {
    onAmountChange(quickAmount.toString());
  };

  const isValidRecipient = recipientAddress && !recipientError && isValidStellarAddress(recipientAddress.trim());
  const isValidAmount = amount && !amountError && isValidXlmAmount(amount.trim());

  return (
    <Card id="payment" className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-white/5">
      <CardHeader>
        <CardTitle>Send Payment</CardTitle>
        <CardDescription>Submit XLM payment on Stellar testnet</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label htmlFor={recipientId} className="text-sm font-medium">
              Recipient Address
            </label>
            <div className="relative">
              <Input
                id={recipientId}
                value={recipientAddress}
                onChange={(event) => onRecipientChange(event.target.value)}
                placeholder="G..."
                aria-describedby={`${recipientId}-hint ${recipientId}-error`}
                aria-invalid={!!recipientError}
                className={`pr-10 ${recipientError ? "border-destructive" : isValidRecipient ? "border-green-500" : ""}`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isCheckingRecipient ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : recipientError ? (
                  <XCircle className="h-4 w-4 text-destructive" />
                ) : isValidRecipient ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : null}
              </div>
            </div>
            {recipientError ? (
              <p id={`${recipientId}-error`} className="text-xs text-destructive" role="alert">
                {recipientError}
              </p>
            ) : (
              <p id={`${recipientId}-hint`} className="text-xs text-muted-foreground">
                Stellar public key starting with G (56 characters)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor={amountId} className="text-sm font-medium">
              Amount (XLM)
            </label>
            <div className="relative">
              <Input
                id={amountId}
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(event) => onAmountChange(event.target.value)}
                placeholder="0.00"
                aria-describedby={`${amountId}-hint ${amountId}-error`}
                aria-invalid={!!amountError}
                className={`pr-10 ${amountError ? "border-destructive" : isValidAmount ? "border-green-500" : ""}`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {amountError ? (
                  <XCircle className="h-4 w-4 text-destructive" />
                ) : isValidAmount ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : null}
              </div>
            </div>
            
            {amountError ? (
              <p id={`${amountId}-error`} className="text-xs text-destructive" role="alert">
                {amountError}
              </p>
            ) : (
              <p id={`${amountId}-hint`} className="text-xs text-muted-foreground">
                Positive number up to 7 decimal places
              </p>
            )}

            {/* Quick Amount Buttons */}
            {!amountError && amount && (
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-xs text-muted-foreground flex items-center">
                  <Coins className="mr-1 h-3 w-3" />
                  Quick amounts:
                </span>
                {QUICK_AMOUNTS.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount(quickAmount)}
                    className="h-8 min-w-[60px] px-2 text-xs"
                  >
                    {quickAmount} XLM
                  </Button>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full min-h-[44px] bg-[var(--brand)] text-white hover:bg-[var(--brand-strong)]"
            disabled={!canSubmit || isSending || !isValidRecipient || !isValidAmount}
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Payment...
              </>
            ) : (
              <>
                <SendHorizontal className="mr-2 h-4 w-4" />
                Send Payment
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
