import { CheckCircle2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PaymentSuccessDialogProps {
  hash: string | null;
  explorerBaseUrl: string;
  onClose: () => void;
  onCopy: (hash: string) => void;
}

export function PaymentSuccessDialog({
  hash,
  explorerBaseUrl,
  onClose,
  onCopy,
}: PaymentSuccessDialogProps) {
  return (
    <AlertDialog open={Boolean(hash)} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" />
          </AlertDialogMedia>
          <AlertDialogTitle>Payment Sent Successfully</AlertDialogTitle>
          <AlertDialogDescription>
            Your testnet transaction is confirmed with hash:
            <br />
            <a
              href={`${explorerBaseUrl}/${hash ?? ""}`}
              target="_blank"
              rel="noreferrer"
              className="break-all text-[var(--brand)] underline underline-offset-4"
            >
              {hash}
            </a>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
          <AlertDialogAction onClick={() => (hash ? onCopy(hash) : undefined)}>
            Copy Hash
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
