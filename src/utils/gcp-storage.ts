import path from "path";
import { Storage } from "@google-cloud/storage";
import multer from "multer";
import { nanoid } from "nanoid";
import { config } from "@/config/config";

const storage = new Storage({
  projectId: config.gcp.projectId,
  credentials: {
    type: config.gcp.credentials.type,
    project_id: config.gcp.projectId,
    private_key_id: config.gcp.credentials.privateKeyId,
    private_key: config.gcp.credentials.privateKey,
    client_email: config.gcp.credentials.clientEmail,
    client_id: config.gcp.credentials.clientId,
  },
});

interface UploadOptions {
  bucket: string;
  folder?: string;
  maxSize?: number; // in MB
}

interface UploadResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

// Utility function for file upload to GCP Cloud Storage
export const uploadFileToGCPStorage = async (
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
    const filePath = `${folder}/${fileName}`;

    // Get bucket reference
    const bucketRef = storage.bucket(bucket);
    const fileRef = bucketRef.file(filePath);

    // Upload file
    await fileRef.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
        metadata: {
          originalName: file.originalname,
          uploadedAt: new Date().toISOString(),
        },
      },
      resumable: false, // Use simple upload for smaller files
    });

    return {
      success: true,
      filePath,
    };
  } catch (err) {
    console.error("GCP Storage upload error:", err);
    return {
      success: false,
      error: "Failed to upload file to GCP Cloud Storage",
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
export const createGCPUploadMiddleware = (maxSizeMB: number = 15) => {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: maxSizeMB * 1024 * 1024,
    },
    fileFilter: createFileFilter(maxSizeMB),
  });

  return upload.single("file");
};

export const gcpUploadMiddleware = createGCPUploadMiddleware(15);
