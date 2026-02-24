import { type FormEvent, useId } from "react";
import { Loader2, SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface PaymentFormCardProps {
  recipientAddress: string;
  amount: string;
  canSubmit: boolean;
  isSending: boolean;
  onRecipientChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function PaymentFormCard({
  recipientAddress,
  amount,
  canSubmit,
  isSending,
  onRecipientChange,
  onAmountChange,
  onSubmit,
}: PaymentFormCardProps) {
  const recipientId = useId();
  const amountId = useId();

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
            <Input
              id={recipientId}
              value={recipientAddress}
              onChange={(event) => onRecipientChange(event.target.value)}
              placeholder="G..."
              aria-describedby={`${recipientId}-hint`}
            />
            <p id={`${recipientId}-hint`} className="text-xs text-muted-foreground">
              Stellar public key starting with G (56 characters)
            </p>
          </div>
          <div className="space-y-2">
            <label htmlFor={amountId} className="text-sm font-medium">
              Amount (XLM)
            </label>
            <Input
              id={amountId}
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(event) => onAmountChange(event.target.value)}
              placeholder="0.00"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-[var(--brand)] text-white hover:bg-[var(--brand-strong)]"
            disabled={!canSubmit || isSending}
          >
            {isSending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <SendHorizontal className="mr-2 h-4 w-4" />
            )}
            Send Payment
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
