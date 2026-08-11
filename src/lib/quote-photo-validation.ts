/**
 * Pure validation for quote photo references. Kept free of `server-only`, the
 * database, and Blob so it can be unit tested and reused on either side.
 *
 * Photos are uploaded to Vercel Blob directly from the browser (see
 * app/api/quotes/upload/route.ts); only the reference travels through the
 * quote API, so these checks guard the client-reported reference.
 */

export type QuotePhotoKind = "damage" | "full_wheel" | "vehicle" | "other";

export const MAX_QUOTE_PHOTOS = 8;
export const MAX_QUOTE_PHOTO_SIZE_BYTES = 8 * 1024 * 1024;
export const ALLOWED_QUOTE_PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export interface QuotePhotoUpload {
  url: string;
  pathname?: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  kind?: QuotePhotoKind;
}

export class QuotePhotoValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuotePhotoValidationError";
  }
}

/** Only accept URLs that point at our Blob store, so a tampered client cannot
 *  link an arbitrary external URL to a lead. */
export function isTrustedBlobUrl(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === "https:" && hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export function safeFileName(fileName: string | undefined, index: number): string {
  const cleaned = fileName
    ?.trim()
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 160);

  return cleaned || `photo-${index + 1}`;
}

export function validateQuotePhotos(photos: QuotePhotoUpload[], { requirePhoto = false } = {}) {
  if (requirePhoto && photos.length < 1) {
    throw new QuotePhotoValidationError("At least one wheel photo is required.");
  }

  if (photos.length > MAX_QUOTE_PHOTOS) {
    throw new QuotePhotoValidationError(`A maximum of ${MAX_QUOTE_PHOTOS} photos can be uploaded.`);
  }

  for (const [index, upload] of photos.entries()) {
    if (!isTrustedBlobUrl(upload.url)) {
      throw new QuotePhotoValidationError(`Photo ${index + 1} has an invalid upload reference.`);
    }

    if (!ALLOWED_QUOTE_PHOTO_TYPES.has(upload.mimeType)) {
      throw new QuotePhotoValidationError(`Photo ${index + 1} must be a JPG, PNG, WEBP, HEIC, or HEIF image.`);
    }

    if (upload.sizeBytes > MAX_QUOTE_PHOTO_SIZE_BYTES) {
      throw new QuotePhotoValidationError(`Photo ${index + 1} must be 8 MB or smaller.`);
    }
  }
}
