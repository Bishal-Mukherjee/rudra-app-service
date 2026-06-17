import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "@/config/config";

export const s3Client = new S3Client({
  region: config.s3.region,
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
  },
});

const DEFAULT_SIGNED_URL_EXPIRY_SECONDS = 3600;

export const getSignedFileUrl = async (
  filePath: string,
  expiresIn = DEFAULT_SIGNED_URL_EXPIRY_SECONDS,
): Promise<string> => {
  const key = filePath.replace(/^\//, "");

  return getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: config.s3.bucket,
      Key: key,
    }),
    { expiresIn },
  );
};

export const getS3ObjectJson = async <T = unknown>(
  filePath: string,
): Promise<T | null> => {
  const key = filePath.replace(/^\//, "");

  try {
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: config.s3.bucket,
        Key: key,
      }),
    );

    const body = await response.Body?.transformToString();
    if (!body) return null;

    return JSON.parse(body) as T;
  } catch (err) {
    console.error("Error fetching S3 object:", err);
    return null;
  }
};
