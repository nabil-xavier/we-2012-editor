// src/utils/database-blob.ts
import type { DatabaseValue } from "@/types/database";

/** MIME used when the bytes carry no recognizable image header */
export const DEFAULT_IMAGE_MIME = "image/png";

/** Magic bytes of the image formats stored in the `.bin` files */
const IMAGE_SIGNATURES: ReadonlyArray<{ mime: string; bytes: number[] }> = [
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/gif", bytes: [0x47, 0x49, 0x46] },
  { mime: "image/bmp", bytes: [0x42, 0x4d] },
  { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] },
];

/** True when `bytes` starts with `signature` */
function startsWith(bytes: Uint8Array, signature: number[]): boolean {
  if (bytes.length < signature.length) {
    return false;
  }
  return signature.every((byte, index) => bytes[index] === byte);
}

/** MIME type guessed from the leading bytes of a blob */
export function detectImageMime(bytes: Uint8Array): string {
  const signature = IMAGE_SIGNATURES.find((entry) => startsWith(bytes, entry.bytes));
  return signature?.mime ?? DEFAULT_IMAGE_MIME;
}

/**
 * Base64 of a byte array, encoded in chunks so a long blob never overflows the
 * argument list of `String.fromCharCode`.
 */
function bytesToBase64(bytes: Uint8Array): string {
  const CHUNK_SIZE = 0x8000;
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += CHUNK_SIZE) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + CHUNK_SIZE));
  }
  return btoa(binary);
}

/**
 * Convert one raw column value into something an `<img src>` accepts:
 * blobs become data URLs, strings pass through unchanged, `null` and empty
 * values stay `null`. Numbers hold no image data.
 */
export function toImageDataUrl(value: DatabaseValue | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (value instanceof Uint8Array) {
    if (value.byteLength === 0) {
      return null;
    }
    return `data:${detectImageMime(value)};base64,${bytesToBase64(value)}`;
  }
  if (typeof value === "string") {
    return value.length > 0 ? value : null;
  }
  return null;
}
