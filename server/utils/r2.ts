import {
  S3Client,
  DeleteObjectCommand,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "~~/env";

/**
 * Cloudflare R2 helper (S3-compatible API).
 *
 * Requirements (env.ts):
 * - R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME
 * - R2_PUBLIC_URL (optional): public CDN base, e.g. https://pub-xxx.r2.dev or a custom domain.
 *   Falls back to a signed GET URL when unset.
 */
export const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
  // SDK adds an empty-body CRC32 to presigned URLs, which R2 then validates
  // against the real uploaded body -> BadDigest. Only send checksums when
  // the operation requires one.
  requestChecksumCalculation: "WHEN_REQUIRED",
});

const BUCKET = env.R2_BUCKET_NAME;
const PUBLIC_URL = env.R2_PUBLIC_URL;

export function r2PublicUrl(key: string): string {
  return `${PUBLIC_URL}/${key}`;
}

export async function r2Upload(buffer: Buffer, key: string, contentType: string): Promise<void> {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}

export async function r2Delete(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

const EXT_CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  png: "image/png",
  webp: "image/webp",
};

/**
 * Fetch a remote image and store it under `key`.
 * Used to re-host Mux-generated thumbnails/previews in R2.
 */
export async function r2StoreFromUrl(
  url: string,
  key: string,
): Promise<{ url: string; key: string }> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType =
    response.headers.get("content-type") ??
    EXT_CONTENT_TYPES[key.split(".").pop() ?? ""] ??
    "application/octet-stream";
  await r2Upload(buffer, key, contentType);
  return { url: await r2Url(key), key };
}

export async function r2Url(key: string): Promise<string> {
  return PUBLIC_URL
    ? r2PublicUrl(key)
    : getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn: 3600 });
}

export function r2PutSignedUrl(key: string, contentType: string): Promise<string> {
  return getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }),
    { expiresIn: 600 },
  );
}
