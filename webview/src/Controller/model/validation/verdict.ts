/**
 * @fileoverview Shared structured validation verdicts for source-derived values.
 */

export type ValidationStatus = "verified-accepts" | "verified-rejects" | "unverified";

export type ValidationVerdict = {
  readonly ok: boolean;
  readonly message: string | null;
  readonly verificationStatus: ValidationStatus;
};

export function valid(verificationStatus: ValidationStatus): ValidationVerdict {
  return { ok: true, message: null, verificationStatus };
}

export function invalid(message: string, verificationStatus: ValidationStatus): ValidationVerdict {
  return { ok: false, message, verificationStatus };
}
