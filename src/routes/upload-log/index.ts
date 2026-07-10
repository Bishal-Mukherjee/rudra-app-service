import express from "express";
import { uploadLog } from "@/controllers/upload-log";
import { logUploadMiddleware } from "@/utils/file-upload";

const router = express.Router();

/**
 * @swagger
 * /log:
 *   post:
 *     summary: Upload a device log file
 *     description: >
 *       Upload a device log file to S3 under
 *       device-logs/{user_id}/{device_id}/{date}/{type}/{file}.
 *       If no auth token is provided, {user_id} is "UNKNOWN".
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               deviceId:
 *                 type: string
 *                 description: Optional device identifier
 *               type:
 *                 type: string
 *                 enum: [regular, forced]
 *                 default: regular
 *                 description: Type of log upload
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Log file to upload
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
 *       400:
 *         description: No file provided or invalid type
 *       413:
 *         description: File size exceeds maximum allowed limit
 *       500:
 *         description: Internal server error or upload failure
 */
router.post("/", logUploadMiddleware, uploadLog);

export default router;
