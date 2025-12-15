import express from "express";
import { getNotifications } from "@/controllers/notifications";

const router = express.Router();

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get notifications
 *     description: Retrieve paginated list of notifications for the SIGHTER role, sorted by creation date in descending order (newest first). Limited to 10 notifications per page.
 *     tags: [Notification]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         required: false
 *         description: Page number for pagination (defaults to 1)
 *         example: 1
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Notifications fetched successfully
 *                 result:
 *                   type: array
 *                   description: Array of notifications (maximum 10 items per page, sorted by creation date descending)
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Unique notification identifier
 *                         example: 550e8400-e29b-41d4-a716-446655440000
 *                       title:
 *                         type: string
 *                         description: Notification title
 *                         example: New Marine Conservation Initiative
 *                       content:
 *                         type: string
 *                         description: Notification content/message
 *                         example: Join our new campaign to protect marine life in coastal areas
 *                       externalUrl:
 *                         type: string
 *                         nullable: true
 *                         description: External URL for more information (optional)
 *                         example: https://example.com/campaigns/marine-conservation
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Notification creation timestamp
 *                         example: 2025-12-15T10:30:00Z
 *                 pagination:
 *                   type: object
 *                   description: Pagination metadata
 *                   properties:
 *                     page:
 *                       type: integer
 *                       description: Current page number
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages available
 *                       example: 5
 *                     totalRecords:
 *                       type: integer
 *                       description: Total number of notifications
 *                       example: 47
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/", getNotifications);

export default router;
