import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  PutBucketCorsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export type B2Env = {
  B2_ENDPOINT?: string;
  B2_KEY_ID?: string;
  B2_APP_KEY?: string;
  B2_BUCKET_NAME?: string;
};

function getB2Config(env?: B2Env) {
  const endpoint = env?.B2_ENDPOINT ?? process.env.B2_ENDPOINT;
  const accessKeyId = env?.B2_KEY_ID ?? process.env.B2_KEY_ID;
  const secretAccessKey = env?.B2_APP_KEY ?? process.env.B2_APP_KEY;
  const bucket = env?.B2_BUCKET_NAME ?? process.env.B2_BUCKET_NAME;

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error("Backblaze credentials are not configured");
  }

  return { endpoint, accessKeyId, secretAccessKey, bucket };
}

const getB2Client = (env?: B2Env) => {
  const { endpoint, accessKeyId, secretAccessKey } = getB2Config(env);

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

const setupBucketCORS = async (env?: B2Env) => {
  try {
    const { bucket } = getB2Config(env);
    const client = getB2Client(env);
    const command = new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: ["http://localhost:3000", "https://porhai.rakib2020-tkg.workers.dev"],
            AllowedMethods: ["PUT", "POST", "GET", "HEAD"],
            AllowedHeaders: ["*"],
            ExposeHeaders: ["ETag"],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    });

    await client.send(command);
    console.log("Backblaze CORS successfully configured!");
  } catch (error) {
    console.error("Failed to setup CORS:", error);
  }
};

const uploadFileToBackblaze = async (
  key: string,
  body: ArrayBuffer,
  contentType: string,
  env?: B2Env,
) => {
  const uploadUrl = await getUploadPresignedUrl(key, contentType, env);

  const response = await fetch(uploadUrl, {
    method: "PUT",
    body,
    headers: { "Content-Type": contentType },
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Backblaze upload failed (${response.status})${detail ? `: ${detail}` : ""}`,
    );
  }
};

const getUploadPresignedUrl = async (
  key: string,
  contentType: string,
  env?: B2Env,
) => {
  const { bucket } = getB2Config(env);
  const client = getB2Client(env);
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(client, command, { expiresIn: 3600 });
};

const getReadPresignedUrl = async (key: string, env?: B2Env) => {
  const { bucket } = getB2Config(env);
  const client = getB2Client(env);
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  return getSignedUrl(client, command, { expiresIn: 72000 });
};

export {
  uploadFileToBackblaze,
  getUploadPresignedUrl,
  getReadPresignedUrl,
  setupBucketCORS,
};
