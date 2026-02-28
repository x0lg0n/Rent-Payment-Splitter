"use client";

import { useState, useCallback } from "react";
import { Plus, X, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidStellarAddress } from "@/lib/stellar/payment";

interface ParticipantInput {
  address: string;
  share: string;
}

interface CreateEscrowFormProps {
  onSubmit: (data: {
    landlord: string;
    participants: string[];
    shares: bigint[];
    deadline: bigint;
  }) => Promise<void>;
  onCancel: () => void;
  walletAddress: string | null;
}

export function CreateEscrowForm({
  onSubmit,
  onCancel,
  walletAddress,
}: CreateEscrowFormProps) {
  const [landlord, setLandlord] = useState("");
  const [participants, setParticipants] = useState<ParticipantInput[]>([
    { address: "", share: "" },
  ]);
  const [deadline, setDeadline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateLandlord = useCallback((address: string) => {
    if (!address) return "Landlord address is required";
    if (!isValidStellarAddress(address)) {
      return "Invalid Stellar address (must start with G)";
    }
    if (address === walletAddress) {
      return "Cannot be your own address";
    }
    return "";
  }, [walletAddress]);

  const validateParticipant = useCallback((address: string, index: number) => {
    if (!address) return `Participant ${index + 1} address is required`;
    if (!isValidStellarAddress(address)) {
      return "Invalid Stellar address";
    }
    if (address === walletAddress) {
      return "Cannot be your own address";
    }
    // Check for duplicates
    const duplicate = participants.findIndex(
      p => p.address === address && p.address !== ""
    );
    if (duplicate !== -1 && duplicate !== index) {
      return "Duplicate address";
    }
    return "";
  }, [participants, walletAddress]);

  const validateShare = useCallback((share: string) => {
    if (!share) return "Share amount is required";
    const numShare = Number(share);
    if (isNaN(numShare) || numShare <= 0) {
      return "Must be a positive number";
    }
    if (numShare > 10000) {
      return "Maximum 10,000 XLM per participant";
    }
    return "";
  }, []);

  const handleAddParticipant = () => {
    setParticipants([...participants, { address: "", share: "" }]);
  };

  const handleRemoveParticipant = (index: number) => {
    if (participants.length === 1) {
      setErrors({ ...errors, participants: "At least one participant required" });
      return;
    }
    const newParticipants = participants.filter((_, i) => i !== index);
    setParticipants(newParticipants);
  };

  const handleParticipantChange = (
    index: number,
    field: "address" | "share",
    value: string
  ) => {
    const newParticipants = [...participants];
    newParticipants[index] = { ...newParticipants[index], [field]: value };
    setParticipants(newParticipants);

    // Clear error when user starts typing
    const errorKey = field === "address" ? `participant_${index}_address` : `participant_${index}_share`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Validate landlord
    const landlordError = validateLandlord(landlord);
    if (landlordError) {
      setErrors({ ...errors, landlord: landlordError });
      setIsSubmitting(false);
      return;
    }

    // Validate participants
    const newErrors: Record<string, string> = {};
    let hasParticipantError = false;

    participants.forEach((p, index) => {
      const addrError = validateParticipant(p.address, index);
      const shareError = validateShare(p.share);
      
      if (addrError) {
        newErrors[`participant_${index}_address`] = addrError;
        hasParticipantError = true;
      }
      if (shareError) {
        newErrors[`participant_${index}_share`] = shareError;
        hasParticipantError = true;
      }
    });

    if (hasParticipantError) {
      setErrors({ ...errors, ...newErrors });
      setIsSubmitting(false);
      return;
    }

    // Validate deadline
    if (!deadline) {
      setErrors({ ...errors, deadline: "Deadline is required" });
      setIsSubmitting(false);
      return;
    }

    const deadlineDate = new Date(deadline);
    const now = new Date();
    if (deadlineDate <= now) {
      setErrors({ ...errors, deadline: "Deadline must be in the future" });
      setIsSubmitting(false);
      return;
    }

    // Convert to stroops (1 XLM = 10,000,000 stroops)
    const shares = participants.map(p => BigInt(Math.floor(Number(p.share) * 10000000)));

    try {
      await onSubmit({
        landlord,
        participants: participants.map(p => p.address),
        shares,
        deadline: BigInt(Math.floor(deadlineDate.getTime() / 1000)),
      });
    } catch (error) {
      setErrors({
        ...errors,
        submit: error instanceof Error ? error.message : "Failed to create escrow",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalShare = participants.reduce((sum, p) => sum + (Number(p.share) || 0), 0);

  return (
    <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-white/5">
      <CardHeader>
        <CardTitle>Create Rent Escrow</CardTitle>
        <CardDescription>
          Set up a rent splitting escrow with your roommates
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Landlord */}
          <div className="space-y-2">
            <Label htmlFor="landlord">Landlord Address</Label>
            <div className="relative">
              <Input
                id="landlord"
                value={landlord}
                onChange={(e) => setLandlord(e.target.value)}
                placeholder="G..."
                className={`pr-10 ${errors.landlord ? "border-destructive" : ""}`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {landlord && (
                  isValidStellarAddress(landlord) ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )
                )}
              </div>
            </div>
            {errors.landlord && (
              <p className="text-xs text-destructive">{errors.landlord}</p>
            )}
          </div>

          {/* Step 2: Participants */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Roommates (Participants)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddParticipant}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Roommate
              </Button>
            </div>

            <div className="space-y-3">
              {participants.map((participant, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Roommate address (G...)"
                      value={participant.address}
                      onChange={(e) =>
                        handleParticipantChange(index, "address", e.target.value)
                      }
                      className={errors[`participant_${index}_address`] ? "border-destructive" : ""}
                    />
                    {errors[`participant_${index}_address`] && (
                      <p className="text-xs text-destructive mt-1">
                        {errors[`participant_${index}_address`]}
                      </p>
                    )}
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      step="0.0000001"
                      placeholder="XLM"
                      value={participant.share}
                      onChange={(e) =>
                        handleParticipantChange(index, "share", e.target.value)
                      }
                      className={errors[`participant_${index}_share`] ? "border-destructive" : ""}
                    />
                    {errors[`participant_${index}_share`] && (
                      <p className="text-xs text-destructive mt-1">
                        {errors[`participant_${index}_share`]}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveParticipant(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {errors.participants && (
              <p className="text-xs text-destructive">{errors.participants}</p>
            )}

            {/* Total */}
            <div className="rounded-lg bg-muted p-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Rent:</span>
                <span className="font-semibold">{totalShare.toFixed(2)} XLM</span>
              </div>
            </div>
          </div>

          {/* Step 3: Deadline */}
          <div className="space-y-2">
            <Label htmlFor="deadline">Payment Deadline</Label>
            <Input
              id="deadline"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className={errors.deadline ? "border-destructive" : ""}
            />
            {errors.deadline && (
              <p className="text-xs text-destructive">{errors.deadline}</p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {errors.submit}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Escrow...
                </>
              ) : (
                "Create Escrow"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
