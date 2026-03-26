const MAX_PRODUCT_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_PRODUCT_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const PRODUCT_IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif";

export function isHeicImageFile(file: File) {
  const lowerName = file.name.toLowerCase();

  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    lowerName.endsWith(".heic") ||
    lowerName.endsWith(".heif")
  );
}

export async function prepareProductImageFile(file: File): Promise<File> {
  const processedFile = isHeicImageFile(file)
    ? await convertHeicToJpeg(file)
    : file;

  if (!ALLOWED_PRODUCT_IMAGE_TYPES.includes(processedFile.type)) {
    throw new Error(`${processedFile.name}: format tidak didukung`);
  }

  if (processedFile.size > MAX_PRODUCT_IMAGE_SIZE_BYTES) {
    throw new Error(`${processedFile.name}: ukuran maksimal 5MB`);
  }

  return processedFile;
}

async function convertHeicToJpeg(file: File): Promise<File> {
  const heic2any = (await import("heic2any")).default;
  const convertedBlob = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.8,
  });
  const normalizedBlob = Array.isArray(convertedBlob)
    ? convertedBlob[0]
    : convertedBlob;

  return new File([normalizedBlob], file.name.replace(/\.(heic|heif)$/i, ".jpg"), {
    type: "image/jpeg",
    lastModified: file.lastModified,
  });
}