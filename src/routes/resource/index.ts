import express from "express";
import { uploadResource } from "@/controllers/resource";
import { uploadMiddleware } from "@/utils/file-upload";

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

export default router;
