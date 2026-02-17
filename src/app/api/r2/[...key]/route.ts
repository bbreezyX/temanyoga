import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const ALLOWED_PREFIXES = ["products/", "payment-proofs/", "accessories/"];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  const objectKey = key.join("/");

  // Only allow known prefixes to prevent arbitrary bucket access
  const isAllowed = ALLOWED_PREFIXES.some((prefix) =>
    objectKey.startsWith(prefix),
  );
  if (!isAllowed) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  try {
    const res = await s3.send(
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: objectKey,
      }),
    );

    const body = res.Body;
    if (!body) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const bytes = await body.transformToByteArray();

    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": res.ContentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
