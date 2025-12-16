import express from "express";
import { uploadResource } from "@/controllers/resource";
import { uploadResourceGCP } from "@/controllers/resource/gcp-controller";
import { uploadMiddleware } from "@/utils/file-upload";
import { gcpUploadMiddleware } from "@/utils/gcp-storage";

const router = express.Router();

/**
 * @swagger
 * /resource:
 *   post:
 *     summary: Upload a file resource
 *     description: Upload a file (image or other resource) to cloud storage. The file is stored in the submissions bucket under the uploads folder. Files are validated for size and type before upload.
 *     tags: [Resource]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload (images, documents, etc.)
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File uploaded successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     filePath:
 *                       type: string
 *                       description: URL or path to the uploaded file
 *                       example: https://storage.example.com/submissions/uploads/image_12345.jpg
 *       400:
 *         description: No file provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No file provided
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       413:
 *         description: File size exceeds maximum allowed limit
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File too large
 *       500:
 *         description: Internal server error or upload failure
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.post("/", uploadMiddleware, uploadResource);

/**
 * @swagger
 * /resource/gcp:
 *   post:
 *     summary: Upload a file resource to GCP Cloud Storage
 *     description: Upload a file (image or other resource) to Google Cloud Storage. The file is stored in the submissions bucket under the uploads folder. Files are validated for size and type before upload.
 *     tags: [Resource]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload (images, documents, etc.)
 *     responses:
 *       200:
 *         description: File uploaded successfully to GCP Cloud Storage
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File uploaded successfully to GCP Cloud Storage
 *                 result:
 *                   type: object
 *                   properties:
 *                     filePath:
 *                       type: string
 *                       description: Path to the uploaded file in GCP bucket
 *                       example: uploads/abc123.jpg
 *                     publicUrl:
 *                       type: string
 *                       description: Public URL to access the file
 *                       example: https://storage.googleapis.com/submissions/uploads/abc123.jpg
 *       400:
 *         description: No file provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No file provided
 *       413:
 *         description: File size exceeds maximum allowed limit
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File too large. Maximum size is 15MB.
 *       500:
 *         description: Internal server error or upload failure
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to upload file to GCP Cloud Storage
 */
router.post("/gcp", gcpUploadMiddleware, uploadResourceGCP);

export default router;
