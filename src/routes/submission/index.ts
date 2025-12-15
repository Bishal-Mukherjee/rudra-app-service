import express from "express";
import { getSubmissions } from "@/controllers/submission";

const router = express.Router();

/**
 * @swagger
 * /submission:
 *   get:
 *     summary: Get user submissions
 *     description: Retrieve a paginated list of all submissions (reportings and sightings) made by the authenticated user. Results are combined from both reportings and sightings tables and sorted by submission time in descending order.
 *     tags: [Submission]
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
 *         description: Submissions fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Submissions fetched successfully
 *                 result:
 *                   type: array
 *                   description: Array of submissions (maximum 10 items per page)
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Unique identifier for the submission
 *                         example: 550e8400-e29b-41d4-a716-446655440000
 *                       type:
 *                         type: string
 *                         description: Submission context type
 *                         example: STRANDING
 *                       submittedAt:
 *                         type: string
 *                         format: date-time
 *                         description: Timestamp when the submission was created
 *                         example: 2025-12-15T10:35:00Z
 *                       district:
 *                         type: string
 *                         description: District name
 *                         example: Kolkata
 *                       block:
 *                         type: string
 *                         description: Block name
 *                         example: Block A
 *                       villageOrGhat:
 *                         type: string
 *                         description: Village or ghat name
 *                         example: Prinsep Ghat
 *                       observedAt:
 *                         type: string
 *                         format: date-time
 *                         description: Timestamp when the incident was observed
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
 *                       description: Total number of submissions across all pages
 *                       example: 47
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/", getSubmissions);

export default router;
