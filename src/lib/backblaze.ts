import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  PutBucketCorsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const getB2Client = async () => {
  const endpoint = process.env.B2_ENDPOINT;
  const accessKeyId = process.env.B2_KEY_ID;
  const secretAccessKey = process.env.B2_APP_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("Backblaze credentials are not configured");
  }

  return new S3Client({
    endpoint,
    region: "auto",
    forcePathStyle: true,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};
const setupBucketCORS = async () => {
  try {
    const client = await getB2Client();
    const command = new PutBucketCorsCommand({
      Bucket: process.env.B2_BUCKET_NAME!,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: ["http://localhost:3000"],
            AllowedMethods: ["PUT", "POST", "GET", "HEAD"],
            AllowedHeaders: ["*"],
            ExposeHeaders: ["ETag"],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    });

    await client.send(command);
    console.log("✅ Backblaze CORS successfully configured!");
  } catch (error) {
    console.error("❌ Failed to setup CORS:", error);
  }
};

const uploadFileToBackblaze = async (
  key: string,
  body: ArrayBuffer | Uint8Array,
  contentType: string,
) => {
  const bucket = process.env.B2_BUCKET_NAME;
  if (!bucket) {
    throw new Error("Backblaze bucket is not configured");
  }

  const uploadUrl = await getUploadPresignedUrl(key, contentType);
  const payload = body instanceof Uint8Array ? body : new Uint8Array(body);

  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: new Blob([payload], { type: contentType }),
    headers: { "Content-Type": contentType },
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Backblaze upload failed (${response.status})${detail ? `: ${detail}` : ""}`,
    );
  }
};

const getUploadPresignedUrl = async (key: string, contentType: string) => {
  const client = await getB2Client();
  const command = new PutObjectCommand({
    Bucket: process.env.B2_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(client, command, { expiresIn: 3600 });
};

const getReadPresignedUrl = async (key: string) => {
  const client = await getB2Client();
  const command = new GetObjectCommand({
    Bucket: process.env.B2_BUCKET_NAME!,
    Key: key,
  });
  return getSignedUrl(client, command, { expiresIn: 72000 }); // 2 hours
};

export {
  uploadFileToBackblaze,
  getUploadPresignedUrl,
  getReadPresignedUrl,
  setupBucketCORS,
};
