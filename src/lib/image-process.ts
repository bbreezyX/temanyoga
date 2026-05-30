import sharp from "sharp";

/** Longest edge for product photos — enough for detail/zoom on retina displays. */
export const PRODUCT_IMAGE_MAX_EDGE = 2560;

/** High WebP quality; visually lossless for storefront use. */
export const PRODUCT_IMAGE_WEBP_QUALITY = 92;

export async function processProductImage(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .rotate()
    .resize(PRODUCT_IMAGE_MAX_EDGE, PRODUCT_IMAGE_MAX_EDGE, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: PRODUCT_IMAGE_WEBP_QUALITY,
      effort: 4,
      smartSubsample: true,
    })
    .toBuffer();
}
