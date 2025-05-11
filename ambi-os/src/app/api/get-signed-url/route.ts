import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

// Initialize the S3 client
// Ensure AWS credentials and region are configured in your environment
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const { fileName, fileType } = await request.json();

    // Create a PutObjectCommand for the S3 bucket
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      ContentType: fileType,
    });

    // Generate a presigned URL for the PutObjectCommand
    // The URL will be valid for 1 hour (3600 seconds)
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return NextResponse.json({ signedUrl });
  } catch (e) {
    console.error("Error generating signed URL:", e);
    return NextResponse.json({ error: "Failed to generate signed URL" }, { status: 500 });
  }
}
