"use client";

import { useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { getCroppedImageBlob } from "@/lib/cropImage";

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const MAX_PADDING = 0.4;

export default function ImageCropper({
  imageSrc,
  onCancel,
  onConfirm,
}: {
  imageSrc: string;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
}) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [padding, setPadding] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    if (!croppedAreaPixels) return;
    setBusy(true);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels, padding);
      onConfirm(blob);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-white">
        {/* Fixed-size container so the Cropper's own fit/zoom math stays
            correct; the padding preview is a pure visual scale on top,
            matching how getCroppedImageBlob renders it on confirm. */}
        <div
          className="absolute inset-0 overflow-hidden rounded-md bg-black"
          style={{ transform: `scale(${1 - padding})` }}
        >
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            aspect={4 / 3}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_area, areaPixels) => setCroppedAreaPixels(areaPixels)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="w-16 shrink-0 text-xs text-[var(--color-muted)]">Zoom</span>
        <input
          type="range"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={0.05}
          value={zoom}
          onChange={(event) => setZoom(Number(event.target.value))}
          className="w-full"
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="w-16 shrink-0 text-xs text-[var(--color-muted)]">Rimpicciolisci</span>
        <input
          type="range"
          min={0}
          max={MAX_PADDING}
          step={0.02}
          value={padding}
          onChange={(event) => setPadding(Number(event.target.value))}
          className="w-full"
        />
      </div>

      <p className="text-xs text-[var(--color-muted)]">
        Trascina per centrare l&apos;immagine, usa lo zoom per ingrandirla e
        &quot;Rimpicciolisci&quot; per lasciare un margine bianco intorno.
      </p>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-[var(--color-border)] px-4 py-1.5 text-sm font-medium hover:bg-[var(--color-surface)]"
        >
          Annulla
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!croppedAreaPixels || busy}
          className="rounded-full bg-[var(--color-primary)] px-4 py-1.5 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
        >
          {busy ? "Applico..." : "Usa questa immagine"}
        </button>
      </div>
    </div>
  );
}
