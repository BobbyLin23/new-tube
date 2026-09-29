/**
 * Applies a CORS policy to the R2 bucket so browsers can PUT thumbnails
 * directly to presigned URLs (and read them back). Idempotent.
 *
 * CORS requires an R2 token with Admin permission (Object Read & Write gets
 * 403 AccessDenied on bucket config). If the API call fails, paste the JSON
 * printed below into: Cloudflare dashboard → R2 → bucket "new-tube" →
 * Settings → CORS policy → Edit.
 *
 * Usage: set -a; source .env; set +a; node scripts/r2-cors.mjs
 */
import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const CORS_RULES = [
  {
    AllowedOrigins: ["*"], // PUTs are gated by the presigned URL signature, not CORS
    AllowedMethods: ["GET", "HEAD", "PUT"],
    AllowedHeaders: ["*"],
    MaxAgeSeconds: 3600,
  },
];

console.log("CORS policy JSON (for the dashboard):");
console.log(JSON.stringify(CORS_RULES, null, 2));

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
});

const Bucket = process.env.R2_BUCKET_NAME;

let applied = false;
try {
  try {
    const existing = await s3.send(new GetBucketCorsCommand({ Bucket }));
    console.log("existing CORS rules:", JSON.stringify(existing.CORSRules));
  } catch {
    console.log("no existing CORS policy");
  }
  await s3.send(new PutBucketCorsCommand({ Bucket, CORSConfiguration: { CORSRules: CORS_RULES } }));
  const check = await s3.send(new GetBucketCorsCommand({ Bucket }));
  console.log("✓ applied via S3 API:", JSON.stringify(check.CORSRules));
  applied = true;
} catch (error) {
  console.warn(`✗ S3 API failed (${error.Code ?? error.name}) — token is Object-scoped.`);
  console.warn("  → paste the JSON above into the dashboard instead (path printed in header).");
}

// End-to-end smoke with object-level ops (works with Object Read & Write token):
// presign -> PUT -> GET -> delete, mirroring the browser upload flow.
const Key = `smoke-test/${Date.now()}.png`;
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

const uploadUrl = await getSignedUrl(
  s3,
  new PutObjectCommand({ Bucket, Key, ContentType: "image/png" }),
  { expiresIn: 600 },
);
const queryKeys = new URL(uploadUrl).searchParams.keys().toArray().join(",");
console.log("presigned URL query params:", queryKeys);
if (queryKeys.includes("checksum")) {
  console.error("✗ presigned URL still carries checksum params");
  process.exit(1);
}

const put = await fetch(uploadUrl, {
  method: "PUT",
  body: png,
  headers: { "Content-Type": "image/png" },
});
console.log("presigned PUT:", put.status, put.ok ? "OK" : await put.text());
if (!put.ok) process.exit(1);

const publicBase = process.env.R2_PUBLIC_URL;
const getUrl = publicBase
  ? `${publicBase}/${Key}`
  : await getSignedUrl(s3, new GetObjectCommand({ Bucket, Key }), { expiresIn: 60 });
const get = await fetch(getUrl);
const body = Buffer.from(await get.arrayBuffer());
console.log(
  "GET:",
  get.status,
  "bytes match:",
  body.equals(png),
  "via:",
  publicBase ? "public URL" : "signed URL",
);

await s3.send(new DeleteObjectCommand({ Bucket, Key }));
const gone = await fetch(getUrl);
console.log("after delete GET:", gone.status);
console.log(applied ? "R2 CORS + SMOKE OK" : "R2 SMOKE OK (CORS still needs dashboard paste)");
