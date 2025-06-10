import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { Logger } from "../../utils/logger";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config();

export const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_ACCESS_SECRET_KEY!,
  },
});

export async function uploadFile(
  filePath: string,
  s3Key: string
): Promise<boolean> {
  const bucketName = process.env.S3_BUCKET_NAME;
  const fileStream = fs.createReadStream(filePath);
  const fileName = path.basename(filePath);

  const isExist = await isFileExist(s3Key);

  if (isExist) {
    const msg = `Skipped (already exists): ${s3Key}`;
    Logger.error(msg);
    return false;
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
    Body: fileStream,
    ContentType: getContentType(fileName),
  });
  try {
    await s3Client.send(command);

    return true;
  } catch (err) {
    const msg = `Failed to upload ${s3Key}: ${err}`;
    Logger.error(msg);
    throw err;
  }
}

export async function getPresignedUrl(
  s3Key: string,
  expiresInSeconds = 3600
): Promise<string> {
  const bucketName = process.env.S3_BUCKET_NAME!;
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
  });

  const url = await getSignedUrl(s3Client, command, {
    expiresIn: expiresInSeconds,
  });
  return url;
}

function getContentType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}

async function isFileExist(s3Key: string): Promise<boolean> {
  const bucketName = process.env.S3_BUCKET_NAME!;

  const headCommand = new HeadObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
  });

  try {
    await s3Client.send(headCommand);
    // 객체가 이미 존재하면 200 OK → 중복으로 간주
    return true;
  } catch (headErr: any) {
    if (headErr.name !== "NotFound") {
      // NotFound가 아니면 다른 오류이므로 throw
      throw headErr;
    }
    return false;
  }
}
