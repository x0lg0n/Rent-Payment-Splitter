"use client";

import { useCallback, useMemo, useState } from "react";
import { AlertTriangle, Loader2, Plus, Users, Wallet2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
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

type SplitMode = "equal" | "custom";

const STROOPS_PER_XLM = 10_000_000;
const MAX_SHARE_XLM = 10_000;
const MAX_PARTICIPANTS = 8;
const MIN_DEADLINE_MINUTES = 5;

function toLocalDatetimeValue(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function formatShortAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function splitStroopsEvenly(totalStroops: bigint, count: number) {
  if (count <= 0) return [];
  const divisor = BigInt(count);
  const baseShare = totalStroops / divisor;
  let remainder = totalStroops % divisor;
  const zero = BigInt(0);
  const one = BigInt(1);

  return Array.from({ length: count }, () => {
    const next = baseShare + (remainder > zero ? one : zero);
    if (remainder > zero) remainder -= one;
    return next;
  });
}

export function CreateEscrowForm({ onSubmit, onCancel, walletAddress }: CreateEscrowFormProps) {
  const [landlord, setLandlord] = useState("");
  const [participants, setParticipants] = useState<ParticipantInput[]>([{ address: "", share: "" }]);
  const [splitMode, setSplitMode] = useState<SplitMode>("equal");
  const [totalRentInput, setTotalRentInput] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const normalizedWalletAddress = walletAddress?.trim().toLowerCase() ?? "";

  const minDeadlineValue = useMemo(
    () => toLocalDatetimeValue(new Date(Date.now() + MIN_DEADLINE_MINUTES * 60_000)),
    [],
  );

  const validParticipants = useMemo(
    () => participants.filter((participant) => isValidStellarAddress(participant.address.trim())).length,
    [participants],
  );

  const effectiveSharesXlm = useMemo(() => {
    if (splitMode === "equal") {
      const total = Number(totalRentInput.trim());
      if (!Number.isFinite(total) || total <= 0 || participants.length === 0) {
        return participants.map(() => 0);
      }
      const equalShare = total / participants.length;
      return participants.map(() => equalShare);
    }

    return participants.map((participant) => {
      const value = Number(participant.share.trim());
      return Number.isFinite(value) && value > 0 ? value : 0;
    });
  }, [participants, splitMode, totalRentInput]);

  const totalShare = useMemo(
    () => effectiveSharesXlm.reduce((sum, value) => sum + value, 0),
    [effectiveSharesXlm],
  );

  const deadlinePreview = useMemo(() => {
    if (!deadline) return "No deadline selected";

    const selected = new Date(deadline);
    if (Number.isNaN(selected.getTime())) return "Invalid deadline";

    const diffMs = selected.getTime() - Date.now();
    if (diffMs <= 0) return "Deadline is in the past";

    const totalMinutes = Math.floor(diffMs / 60_000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) return `Due in ${days}d ${hours}h`;
    if (hours > 0) return `Due in ${hours}h ${minutes}m`;
    return `Due in ${minutes}m`;
  }, [deadline]);

  const clearError = useCallback((key: string) => {
    setErrors((previous) => {
      if (!previous[key]) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  }, []);

  const clearShareErrors = useCallback(() => {
    setErrors((previous) => {
      const next: Record<string, string> = {};
      for (const [key, value] of Object.entries(previous)) {
        if (key === "total_rent" || key.startsWith("participant_") && key.endsWith("_share")) continue;
        next[key] = value;
      }
      return next;
    });
  }, []);

  const validateForm = useCallback(() => {
    const nextErrors: Record<string, string> = {};
    const normalizedLandlord = landlord.trim();

    if (!normalizedLandlord) {
      nextErrors.landlord = "Landlord address is required";
    } else if (!isValidStellarAddress(normalizedLandlord)) {
      nextErrors.landlord = "Invalid Stellar address";
    } else if (normalizedLandlord.toLowerCase() === normalizedWalletAddress) {
      nextErrors.landlord = "Landlord cannot be your connected wallet";
    }

    if (participants.length === 0) {
      nextErrors.participants = "At least one participant is required";
    }

    const seenAddresses = new Map<string, number>();

    participants.forEach((participant, index) => {
      const address = participant.address.trim();
      const share = participant.share.trim();
      const addressKey = `participant_${index}_address`;
      const shareKey = `participant_${index}_share`;

      if (!address) {
        nextErrors[addressKey] = `Participant ${index + 1} address is required`;
      } else if (!isValidStellarAddress(address)) {
        nextErrors[addressKey] = "Invalid Stellar address";
      } else if (address.toLowerCase() === normalizedWalletAddress) {
        nextErrors[addressKey] = "Participant cannot be your connected wallet";
      } else if (normalizedLandlord && address.toLowerCase() === normalizedLandlord.toLowerCase()) {
        nextErrors[addressKey] = "Participant cannot match landlord";
      } else if (seenAddresses.has(address.toLowerCase())) {
        const duplicateIndex = seenAddresses.get(address.toLowerCase()) ?? 0;
        nextErrors[addressKey] = `Duplicate of participant ${duplicateIndex + 1}`;
      } else {
        seenAddresses.set(address.toLowerCase(), index);
      }

      if (splitMode === "custom") {
        if (!share) {
          nextErrors[shareKey] = "Share amount is required";
        } else {
          const shareValue = Number(share);
          if (!Number.isFinite(shareValue) || shareValue <= 0) {
            nextErrors[shareKey] = "Share must be greater than 0";
          } else if (shareValue > MAX_SHARE_XLM) {
            nextErrors[shareKey] = `Maximum ${MAX_SHARE_XLM.toLocaleString()} XLM`;
          }
        }
      }
    });

    if (splitMode === "equal") {
      const total = Number(totalRentInput.trim());
      if (!totalRentInput.trim()) {
        nextErrors.total_rent = "Total rent is required for equal split";
      } else if (!Number.isFinite(total) || total <= 0) {
        nextErrors.total_rent = "Total rent must be greater than 0";
      } else {
        const perParticipant = total / Math.max(participants.length, 1);
        if (perParticipant > MAX_SHARE_XLM) {
          nextErrors.total_rent = `Each share must be ${MAX_SHARE_XLM.toLocaleString()} XLM or less`;
        }
      }
    }

    if (!deadline) {
      nextErrors.deadline = "Deadline is required";
    } else {
      const deadlineDate = new Date(deadline);
      if (Number.isNaN(deadlineDate.getTime())) {
        nextErrors.deadline = "Invalid deadline";
      } else if (deadlineDate.getTime() <= Date.now() + MIN_DEADLINE_MINUTES * 60_000) {
        nextErrors.deadline = `Deadline must be at least ${MIN_DEADLINE_MINUTES} minutes in the future`;
      }
    }

    return nextErrors;
  }, [deadline, landlord, normalizedWalletAddress, participants, splitMode, totalRentInput]);

  const handleAddParticipant = useCallback(() => {
    if (participants.length >= MAX_PARTICIPANTS) {
      setErrors((previous) => ({
        ...previous,
        participants: `Maximum ${MAX_PARTICIPANTS} participants allowed`,
      }));
      return;
    }

    setParticipants((previous) => [...previous, { address: "", share: "" }]);
    clearError("participants");
  }, [clearError, participants.length]);

  const handleRemoveParticipant = useCallback((index: number) => {
    if (participants.length === 1) {
      setErrors((previous) => ({ ...previous, participants: "At least one participant is required" }));
      return;
    }

    setParticipants((previous) => previous.filter((_, participantIndex) => participantIndex !== index));
    setErrors((previous) => {
      const next = { ...previous };
      delete next.participants;
      delete next[`participant_${index}_address`];
      delete next[`participant_${index}_share`];
      return next;
    });
  }, [participants.length]);

  const handleParticipantChange = useCallback(
    (index: number, field: "address" | "share", value: string) => {
      setParticipants((previous) =>
        previous.map((participant, participantIndex) =>
          participantIndex === index ? { ...participant, [field]: value } : participant,
        ),
      );

      if (field === "address") {
        clearError(`participant_${index}_address`);
      } else {
        clearError(`participant_${index}_share`);
      }
      clearError("participants");
    },
    [clearError],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    setErrors({});

    const normalizedLandlord = landlord.trim();
    const normalizedParticipants = participants.map((participant) => participant.address.trim());

    const shares =
      splitMode === "equal"
        ? splitStroopsEvenly(
            BigInt(Math.round(Number(totalRentInput.trim()) * STROOPS_PER_XLM)),
            normalizedParticipants.length,
          )
        : participants.map((participant) =>
            BigInt(Math.round(Number(participant.share.trim()) * STROOPS_PER_XLM)),
          );

    try {
      await onSubmit({
        landlord: normalizedLandlord,
        participants: normalizedParticipants,
        shares,
        deadline: BigInt(Math.floor(new Date(deadline).getTime() / 1000)),
      });
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "Failed to create escrow",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="rounded-3xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <CardHeader className="space-y-4">
        <div className="space-y-1">
          <CardTitle className="text-2xl tracking-tight text-slate-950 dark:text-white">Create rent escrow</CardTitle>
          <CardDescription className="text-sm text-slate-600 dark:text-slate-300">
            Simplified flow: add landlord, roommates, choose split mode, then set the deadline.
          </CardDescription>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
            <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-300">Wallet</p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
              {walletAddress ? formatShortAddress(walletAddress) : "Not connected"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
            <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-300">Participants</p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
              {participants.length} ({validParticipants} valid)
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
            <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-300">Total rent</p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{totalShare.toFixed(2)} XLM</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <section className="space-y-2">
            <Label htmlFor="landlord" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Landlord wallet
            </Label>
            <div className="relative">
              <Input
                id="landlord"
                value={landlord}
                onChange={(event) => {
                  setLandlord(event.target.value);
                  clearError("landlord");
                }}
                placeholder="G..."
                className={cn("pr-10", errors.landlord && "border-destructive")}
              />
              <Wallet2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
            {errors.landlord ? (
              <p className="text-xs text-destructive">{errors.landlord}</p>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-300">Use a valid Stellar address that starts with `G`.</p>
            )}
          </section>

          <section className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/45">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                <Users className="h-4 w-4" />
                Participants
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleAddParticipant}>
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => {
                  setSplitMode("equal");
                  clearShareErrors();
                }}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition",
                  splitMode === "equal"
                    ? "bg-slate-950 text-white dark:bg-white dark:text-slate-900"
                    : "bg-white text-slate-600 hover:text-slate-900 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white",
                )}
              >
                Equal split
              </button>
              <button
                type="button"
                onClick={() => {
                  setSplitMode("custom");
                  clearShareErrors();
                  clearError("total_rent");
                }}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition",
                  splitMode === "custom"
                    ? "bg-slate-950 text-white dark:bg-white dark:text-slate-900"
                    : "bg-white text-slate-600 hover:text-slate-900 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white",
                )}
              >
                Custom shares
              </button>
            </div>

            {splitMode === "equal" ? (
              <div className="space-y-1.5">
                <Label htmlFor="total-rent">Total rent (XLM)</Label>
                <Input
                  id="total-rent"
                  type="number"
                  step="0.0000001"
                  min="0"
                  value={totalRentInput}
                  onChange={(event) => {
                    setTotalRentInput(event.target.value);
                    clearError("total_rent");
                  }}
                  placeholder="1200"
                  className={cn(errors.total_rent && "border-destructive")}
                />
                {errors.total_rent ? (
                  <p className="text-xs text-destructive">{errors.total_rent}</p>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-300">
                    Each participant pays an equal share automatically.
                  </p>
                )}
              </div>
            ) : null}

            <div className="space-y-2.5">
              {participants.map((participant, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className={cn("grid gap-2", splitMode === "custom" ? "sm:grid-cols-[1fr_150px_auto]" : "sm:grid-cols-[1fr_170px_auto]")}>
                    <div>
                      <Input
                        placeholder={`Participant ${index + 1} address`}
                        value={participant.address}
                        onChange={(event) => handleParticipantChange(index, "address", event.target.value)}
                        className={cn(errors[`participant_${index}_address`] && "border-destructive")}
                      />
                      {errors[`participant_${index}_address`] ? (
                        <p className="mt-1 text-xs text-destructive">{errors[`participant_${index}_address`]}</p>
                      ) : null}
                    </div>

                    {splitMode === "custom" ? (
                      <div>
                        <Input
                          type="number"
                          step="0.0000001"
                          min="0"
                          placeholder="Share (XLM)"
                          value={participant.share}
                          onChange={(event) => handleParticipantChange(index, "share", event.target.value)}
                          className={cn(errors[`participant_${index}_share`] && "border-destructive")}
                        />
                        {errors[`participant_${index}_share`] ? (
                          <p className="mt-1 text-xs text-destructive">{errors[`participant_${index}_share`]}</p>
                        ) : null}
                      </div>
                    ) : (
                      <div className="flex h-10 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {effectiveSharesXlm[index].toFixed(2)} XLM
                      </div>
                    )}

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 justify-self-end rounded-xl"
                      onClick={() => handleRemoveParticipant(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {errors.participants ? <p className="text-xs text-destructive">{errors.participants}</p> : null}
          </section>

          <section className="space-y-2">
            <Label htmlFor="deadline" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Funding deadline
            </Label>
            <Input
              id="deadline"
              type="datetime-local"
              value={deadline}
              min={minDeadlineValue}
              onChange={(event) => {
                setDeadline(event.target.value);
                clearError("deadline");
              }}
              className={cn(errors.deadline && "border-destructive")}
            />
            {errors.deadline ? (
              <p className="text-xs text-destructive">{errors.deadline}</p>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-300">
                {deadlinePreview} · Minimum lead time {MIN_DEADLINE_MINUTES} minutes.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800/50">
            <p className="font-medium text-slate-900 dark:text-white">Summary</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              <div className="rounded-lg bg-white px-2.5 py-2 dark:bg-slate-900">
                <p className="text-xs text-slate-500 dark:text-slate-300">Landlord</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                  {landlord.trim() && isValidStellarAddress(landlord.trim()) ? formatShortAddress(landlord.trim()) : "Not set"}
                </p>
              </div>
              <div className="rounded-lg bg-white px-2.5 py-2 dark:bg-slate-900">
                <p className="text-xs text-slate-500 dark:text-slate-300">Split mode</p>
                <p className="mt-1 font-semibold text-slate-900 capitalize dark:text-white">{splitMode}</p>
              </div>
              <div className="rounded-lg bg-white px-2.5 py-2 dark:bg-slate-900">
                <p className="text-xs text-slate-500 dark:text-slate-300">Total rent</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">{totalShare.toFixed(2)} XLM</p>
              </div>
            </div>
          </section>

          {errors.submit ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errors.submit}
            </div>
          ) : null}

          {!walletAddress ? (
            <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-600/40 dark:bg-amber-500/10 dark:text-amber-300">
              <span className="inline-flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                Connect your wallet to create an escrow.
              </span>
            </div>
          ) : null}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel} className="h-10 flex-1 rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !walletAddress} className="h-10 flex-1 rounded-xl">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create escrow"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
