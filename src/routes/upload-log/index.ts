import express from "express";
import { uploadLog } from "@/controllers/upload-log";
import { logUploadMiddleware } from "@/utils/file-upload";

const router = express.Router();

/**
 * @swagger
 * /upload-log:
 *   post:
 *     summary: Upload a log file
 *     description: Upload a .db or .txt log file to the logs storage bucket.
 *     tags: [Logs]
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
 *                 description: Log file (.db or .txt)
 *     responses:
 *       200:
 *         description: Log file uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Log file uploaded successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     filePath:
 *                       type: string
 *                     publicUrl:
 *                       type: string
 *                       description: Public URL to access the uploaded log file
 *       400:
 *         description: No file provided or invalid file type
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       413:
 *         description: File size exceeds maximum allowed limit
 *       500:
 *         description: Internal server error or upload failure
 */
router.post("/upload", logUploadMiddleware, uploadLog);

export default router;
