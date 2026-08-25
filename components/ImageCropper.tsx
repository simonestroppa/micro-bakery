"use client";

import { useState } from "react";
import Cropper, { type Area, type MediaSize, type Point } from "react-easy-crop";
import { getCroppedImageBlob } from "@/lib/cropImage";

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const MAX_PADDING = 0.4;
const PREVIEW_WIDTH = 240;
const PREVIEW_HEIGHT = 180;

function ResultPreview({
  imageSrc,
  crop,
  mediaSize,
  padding,
}: {
  imageSrc: string;
  crop: Area;
  mediaSize: MediaSize;
  padding: number;
}) {
  const innerWidth = PREVIEW_WIDTH * (1 - padding);
  const innerHeight = PREVIEW_HEIGHT * (1 - padding);
  const innerLeft = (PREVIEW_WIDTH - innerWidth) / 2;
  const innerTop = (PREVIEW_HEIGHT - innerHeight) / 2;

  const scale = (PREVIEW_WIDTH / crop.width) * (1 - padding);
  const imageWidth = mediaSize.naturalWidth * scale;
  const imageHeight = mediaSize.naturalHeight * scale;
  const imageLeft = innerLeft - crop.x * scale;
  const imageTop = innerTop - crop.y * scale;

  return (
    <div
      style={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT }}
      className="relative mx-auto overflow-hidden rounded-md border border-[var(--color-border)] bg-white"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt=""
        style={{
          position: "absolute",
          left: imageLeft,
          top: imageTop,
          width: imageWidth,
          height: imageHeight,
          maxWidth: "none",
        }}
      />
    </div>
  );
}

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
  const [mediaSize, setMediaSize] = useState<MediaSize | null>(null);
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
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-black">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          aspect={4 / 3}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onMediaLoaded={setMediaSize}
          onCropAreaChange={(_area, areaPixels) => setCroppedAreaPixels(areaPixels)}
          onCropComplete={(_area, areaPixels) => setCroppedAreaPixels(areaPixels)}
        />
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

      {croppedAreaPixels && mediaSize && (
        <div className="space-y-1">
          <p className="text-center text-xs text-[var(--color-muted)]">Anteprima risultato</p>
          <ResultPreview
            imageSrc={imageSrc}
            crop={croppedAreaPixels}
            mediaSize={mediaSize}
            padding={padding}
          />
        </div>
      )}

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
