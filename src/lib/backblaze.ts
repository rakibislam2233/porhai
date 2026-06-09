import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
const getB2Client = async () => {
  return new S3Client({
    endpoint: process.env.B2_ENDPOINT,
    region: "auto",
    credentials: {
      accessKeyId: process.env.B2_KEY_ID!,
      secretAccessKey: process.env.B2_APP_KEY!,
    },
  });
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

export { getUploadPresignedUrl, getReadPresignedUrl };
