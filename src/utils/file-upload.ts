import path from "path";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import { nanoid } from "nanoid";
import { config } from "@/config/config";
import { s3Client } from "@/utils/s3-client";

interface UploadOptions {
  bucket: string;
  folder?: string;
  maxSize?: number; // in MB
}

interface UploadResult {
  success: boolean;
  filePath?: string;
  publicUrl?: string;
  error?: string;
}

// Utility function for file upload
export const uploadFileToStorage = async (
  file: Express.Multer.File,
  options: UploadOptions,
): Promise<UploadResult> => {
  const { bucket, folder = "uploads", maxSize = 15 } = options;

  try {
    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return {
        success: false,
        error: `File too large. Maximum size is ${maxSize}MB.`,
      };
    }

    const extension = path.extname(file.originalname);
    const fileId = nanoid();
    const fileName = `${fileId}${extension}`;
    const objectKey = `${bucket}/${folder}/${fileName}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: config.s3.bucket,
        Key: objectKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      success: true,
      filePath: objectKey,
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      error: "Failed to upload file to storage",
    };
  }
};

// Custom file filter to check size before processing
const createFileFilter = (maxSizeMB: number = 15) => {
  return (req: any, file: any, cb: any) => {
    const contentLength = parseInt(req.headers["content-length"] || "0");
    const maxSize = maxSizeMB * 1024 * 1024;

    if (contentLength > maxSize) {
      const error = new Error("File too large") as any;
      error.code = "LIMIT_FILE_SIZE";
      return cb(error, false);
    }

    cb(null, true);
  };
};

// Create multer middleware with custom max size
export const createUploadMiddleware = (maxSizeMB: number = 15) => {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: maxSizeMB * 1024 * 1024,
    },
    fileFilter: createFileFilter(maxSizeMB),
  });

  return upload.single("file");
};

export const uploadMiddleware = createUploadMiddleware(15);

const LOG_FILE_EXTENSIONS = [".db", ".txt"];

const createLogFileFilter = (maxSizeMB: number = 15) => {
  return (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const contentLength = parseInt(req.headers["content-length"] || "0");
    const maxSize = maxSizeMB * 1024 * 1024;

    if (contentLength > maxSize) {
      const error = new Error("File too large") as any;
      error.code = "LIMIT_FILE_SIZE";
      return cb(error, false);
    }

    const extension = path.extname(file.originalname).toLowerCase();
    if (!LOG_FILE_EXTENSIONS.includes(extension)) {
      return cb(new Error("Only .db and .txt files are allowed"));
    }

    cb(null, true);
  };
};

export const createLogUploadMiddleware = (maxSizeMB: number = 15) => {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: maxSizeMB * 1024 * 1024,
    },
    fileFilter: createLogFileFilter(maxSizeMB),
  });

  return upload.single("file");
};

export const logUploadMiddleware = createLogUploadMiddleware(15);
