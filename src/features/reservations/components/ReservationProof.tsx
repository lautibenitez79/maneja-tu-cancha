import { useEffect, useState } from "react";
import {
  ExternalLink,
  Loader2,
  Upload,
} from "lucide-react";

import {
  reservationTrackingService,
} from "../services/reservation-tracking.service";

import type {
  ReservationTracking,
} from "../types/reservation-tracking.types";

interface ReservationProofProps {
  reservation: ReservationTracking;
  clubId: string;
  onUpload: (file: File) => Promise<void>;
}

export function ReservationProof({
  reservation,
  onUpload,
}: ReservationProofProps) {
  const [uploading, setUploading] =
    useState(false);

  const [opening, setOpening] =
    useState(false);

  const [signedUrl, setSignedUrl] =
    useState<string | null>(null);

  const proofPath =
    reservation.balance_payment_proof_url;

  useEffect(() => {
    setSignedUrl(null);
  }, [proofPath]);

  async function openProof() {
    if (!proofPath) return;

    try {
      setOpening(true);

      const url =
        await reservationTrackingService.getProofUrl(
          proofPath,
        );

      setSignedUrl(url);

      window.open(
        url,
        "_blank",
        "noopener,noreferrer",
      );
    } catch (error) {
      console.error(error);
    } finally {
      setOpening(false);
    }
  }

  async function handleFile(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);

      await onUpload(file);
    } finally {
      setUploading(false);

      event.target.value = "";
    }
  }

  return (
    <div className="min-w-[160px] space-y-2">
      {proofPath ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              void openProof()
            }
            disabled={opening}
            className="inline-flex h-8 items-center gap-1 rounded-lg border px-2 text-xs font-medium disabled:opacity-50"
          >
            {opening ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ExternalLink className="h-3.5 w-3.5" />
            )}

            Ver
          </button>

          <label className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg border px-2 text-xs font-medium">
            <Upload className="h-3.5 w-3.5" />

            Cambiar

            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              disabled={uploading}
              onChange={handleFile}
            />
          </label>
        </div>
      ) : (
        <label className="inline-flex h-8 cursor-pointer items-center justify-center gap-1 rounded-lg border px-3 text-xs font-medium">
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}

          Adjuntar comprobante

          <input
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            disabled={uploading}
            onChange={handleFile}
          />
        </label>
      )}

      {signedUrl && (
        <a
          href={signedUrl}
          target="_blank"
          rel="noreferrer"
          className="hidden"
        >
          Comprobante
        </a>
      )}
    </div>
  );
}