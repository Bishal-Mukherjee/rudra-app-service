import express from "express";
import { getTiers } from "@/controllers/tier";
import {
  getTierQuestions,
  submitTierAssessment,
} from "@/controllers/tier-assessment";

const router = express.Router();

/**
 * @swagger
 * /tier:
 *   get:
 *     summary: Get accessible tiers
 *     description: Retrieve all active tiers accessible to the authenticated user based on their current tier level. Returns tiers that are less than or equal to the user's current tier, sorted in descending order. Also includes the final tier level available in the system.
 *     tags: [Tier]
 *     responses:
 *       200:
 *         description: Tiers fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tiers fetched successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     tiers:
 *                       type: array
 *                       description: Array of accessible tiers sorted in descending order
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: Unique identifier for the tier
 *                             example: 550e8400-e29b-41d4-a716-446655440000
 *                           title:
 *                             type: object
 *                             properties:
 *                               en:
 *                                 type: string
 *                                 description: Tier title in English
 *                                 example: Beginner
 *                               bn:
 *                                 type: string
 *                                 description: Tier title in Bengali
 *                                 example: শিক্ষানবিস
 *                           description:
 *                             type: object
 *                             properties:
 *                               en:
 *                                 type: string
 *                                 description: Tier description in English
 *                                 example: Complete basic training modules
 *                               bn:
 *                                 type: string
 *                                 description: Tier description in Bengali
 *                                 example: মৌলিক প্রশিক্ষণ মডিউল সম্পূর্ণ করুন
 *                           tier:
 *                             type: string
 *                             description: Tier level identifier
 *                             example: TIER_1
 *                           modules:
 *                             type: integer
 *                             description: Number of active modules in this tier
 *                             example: 5
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             description: Tier creation timestamp
 *                             example: 2025-01-01T00:00:00Z
 *                           lastUpdatedAt:
 *                             type: string
 *                             format: date-time
 *                             description: Tier last update timestamp
 *                             example: 2025-12-01T00:00:00Z
 *                     finalTier:
 *                       type: string
 *                       description: The highest tier level available in the system
 *                       example: TIER_3
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/", getTiers);

/**
 * @swagger
 * /tier/{tier}/questions:
 *   get:
 *     summary: Get tier assessment questions
 *     description: Retrieve active MCQ questions for the authenticated user's current tier assessment. Only available when the requested tier matches the user's current tier.
 *     tags: [Tier]
 *     parameters:
 *       - in: path
 *         name: tier
 *         required: true
 *         schema:
 *           type: string
 *           example: TIER_1
 *         description: Tier level identifier
 *     responses:
 *       200:
 *         description: Tier assessment questions fetched successfully
 *       400:
 *         description: Invalid tier
 *       403:
 *         description: Forbidden - tier does not match user's current tier
 *       404:
 *         description: No assessment questions found for tier
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/:tier/questions", getTierQuestions);

/**
 * @swagger
 * /tier/{tier}/assessment:
 *   post:
 *     summary: Submit tier assessment
 *     description: Submit answers for the current tier assessment. The user is promoted to the next tier only when all answers are correct.
 *     tags: [Tier]
 *     parameters:
 *       - in: path
 *         name: tier
 *         required: true
 *         schema:
 *           type: string
 *           example: TIER_1
 *         description: Tier level identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - answers
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - question
 *                     - option
 *                   properties:
 *                     question:
 *                       type: string
 *                       format: uuid
 *                     option:
 *                       type: string
 *                       format: uuid
 *     responses:
 *       200:
 *         description: Tier assessment submitted successfully
 *       400:
 *         description: Validation error or incomplete submission
 *       403:
 *         description: Forbidden - tier does not match user's current tier
 *       404:
 *         description: No assessment questions found for tier
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/:tier/assessment", submitTierAssessment);

export default router;
