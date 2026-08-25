export type PixelCrop = { x: number; y: number; width: number; height: number };

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("Immagine non valida.")));
    image.src = src;
  });
}

const OUTPUT_WIDTH = 1200;
const OUTPUT_HEIGHT = 900;

/**
 * `padding` (0-1) shrinks the cropped image within the output canvas,
 * centered, leaving a white margin around it.
 */
export async function getCroppedImageBlob(
  imageSrc: string,
  crop: PixelCrop,
  padding = 0
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_WIDTH;
  canvas.height = OUTPUT_HEIGHT;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Impossibile preparare il ritaglio dell'immagine.");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

  const scale = 1 - Math.min(Math.max(padding, 0), 0.9);
  const destWidth = OUTPUT_WIDTH * scale;
  const destHeight = OUTPUT_HEIGHT * scale;
  const destX = (OUTPUT_WIDTH - destWidth) / 2;
  const destY = (OUTPUT_HEIGHT - destHeight) / 2;

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    destX,
    destY,
    destWidth,
    destHeight
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Impossibile generare l'immagine ritagliata."));
      },
      "image/jpeg",
      0.9
    );
  });
}
