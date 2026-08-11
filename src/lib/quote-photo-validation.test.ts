import { describe, it, expect } from "vitest";
import {
  isTrustedBlobUrl,
  safeFileName,
  validateQuotePhotos,
  QuotePhotoValidationError,
  MAX_QUOTE_PHOTOS,
  type QuotePhotoUpload,
} from "./quote-photo-validation";

const goodUrl = "https://store123.blob.vercel-storage.com/quotes/abc.jpg";

function photo(overrides: Partial<QuotePhotoUpload> = {}): QuotePhotoUpload {
  return {
    url: goodUrl,
    fileName: "wheel.jpg",
    mimeType: "image/jpeg",
    sizeBytes: 1024,
    ...overrides,
  };
}

describe("isTrustedBlobUrl", () => {
  it("accepts https URLs on the vercel blob store", () => {
    expect(isTrustedBlobUrl(goodUrl)).toBe(true);
  });

  it("rejects non-blob hosts", () => {
    expect(isTrustedBlobUrl("https://evil.example.com/x.jpg")).toBe(false);
  });

  it("rejects http (non-TLS) blob URLs", () => {
    expect(isTrustedBlobUrl("http://store.blob.vercel-storage.com/x.jpg")).toBe(false);
  });

  it("rejects a host that merely contains the domain as a substring", () => {
    expect(isTrustedBlobUrl("https://blob.vercel-storage.com.evil.com/x")).toBe(false);
  });

  it("rejects garbage", () => {
    expect(isTrustedBlobUrl("not a url")).toBe(false);
  });
});

describe("validateQuotePhotos", () => {
  it("accepts a valid photo", () => {
    expect(() => validateQuotePhotos([photo()])).not.toThrow();
  });

  it("accepts an empty list when photos are not required", () => {
    expect(() => validateQuotePhotos([])).not.toThrow();
  });

  it("requires at least one photo when requirePhoto is set", () => {
    expect(() => validateQuotePhotos([], { requirePhoto: true })).toThrow(
      QuotePhotoValidationError
    );
  });

  it("rejects an untrusted URL (spoofed reference)", () => {
    expect(() => validateQuotePhotos([photo({ url: "https://evil.example.com/x.jpg" })]))
      .toThrow(/invalid upload reference/i);
  });

  it("rejects a disallowed mime type", () => {
    expect(() => validateQuotePhotos([photo({ mimeType: "application/pdf" })]))
      .toThrow(/JPG, PNG, WEBP/i);
  });

  it("rejects a file over 8 MB", () => {
    expect(() => validateQuotePhotos([photo({ sizeBytes: 9 * 1024 * 1024 })]))
      .toThrow(/8 MB or smaller/i);
  });

  it("rejects more than the maximum number of photos", () => {
    const many = Array.from({ length: MAX_QUOTE_PHOTOS + 1 }, () => photo());
    expect(() => validateQuotePhotos(many)).toThrow(/maximum of/i);
  });

  it("reports the offending photo's position", () => {
    expect(() => validateQuotePhotos([photo(), photo({ mimeType: "text/plain" })]))
      .toThrow(/Photo 2/);
  });
});

describe("safeFileName", () => {
  it("keeps a normal name", () => {
    expect(safeFileName("wheel-1.jpg", 0)).toBe("wheel-1.jpg");
  });

  it("replaces unsafe characters", () => {
    expect(safeFileName("my wheel (front)!.png", 0)).toBe("my-wheel-front-.png");
  });

  it("falls back to an index-based name when empty", () => {
    expect(safeFileName("", 2)).toBe("photo-3");
    expect(safeFileName(undefined, 0)).toBe("photo-1");
  });
});
