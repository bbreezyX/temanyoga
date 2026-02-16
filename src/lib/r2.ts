import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToR2(
  file: Buffer,
  folder: string,
  contentType: string
): Promise<{ url: string; key: string }> {
  const ext = contentType.split("/")[1] || "bin";
  const key = `${folder}/${nanoid()}.${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  );

  const url = `${process.env.R2_PUBLIC_URL}/${key}`;
  return { url, key };
}

export async function deleteFromR2(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    })
  );
}
