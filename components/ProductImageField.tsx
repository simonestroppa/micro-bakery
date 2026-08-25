"use client";

import { useRef, useState } from "react";
import ImageCropper from "@/components/ImageCropper";

export default function ProductImageField({
  currentImageUrl,
  onCroppingChange,
}: {
  currentImageUrl: string | null;
  onCroppingChange?: (isCropping: boolean) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rawSrc, setRawSrc] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setRawSrc(URL.createObjectURL(file));
    onCroppingChange?.(true);
  }

  function handleCancelCrop() {
    if (rawSrc) URL.revokeObjectURL(rawSrc);
    setRawSrc(null);
    onCroppingChange?.(false);
  }

  function handleConfirmCrop(blob: Blob) {
    const file = new File([blob], "prodotto.jpg", { type: "image/jpeg" });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    if (fileInputRef.current) fileInputRef.current.files = dataTransfer.files;

    if (rawSrc) URL.revokeObjectURL(rawSrc);
    setRawSrc(null);
    onCroppingChange?.(false);

    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(blob);
    });
  }

  const displayUrl = previewUrl ?? currentImageUrl;

  return (
    <div className="space-y-2 sm:col-span-2">
      <label className="block text-sm font-medium">Immagine</label>

      {rawSrc ? (
        <ImageCropper imageSrc={rawSrc} onCancel={handleCancelCrop} onConfirm={handleConfirmCrop} />
      ) : (
        <>
          {displayUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displayUrl}
              alt=""
              className="aspect-[4/3] w-full max-w-xs rounded-md border border-[var(--color-border)] object-cover"
            />
          )}

          <input
            ref={fileInputRef}
            name="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm"
          />

          {previewUrl && (
            <p className="text-xs text-[var(--color-muted)]">
              Nuova immagine pronta: verra&apos; salvata al posto di quella attuale.
            </p>
          )}

          {currentImageUrl && !previewUrl && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="removeImage" className="h-4 w-4" />
              Rimuovi immagine attuale
            </label>
          )}
        </>
      )}
    </div>
  );
}
