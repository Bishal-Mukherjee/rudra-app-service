import express from "express";
import { getTiers, upgradeTier } from "@/controllers/tier";

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
 * /tier/upgrade:
 *   get:
 *     summary: Upgrade user tier
 *     description: Upgrade the authenticated user's tier to the next level (e.g., from TIER_1 to TIER_2). The user must have completed the requirements of their current tier before upgrading.
 *     tags: [Tier]
 *     responses:
 *       200:
 *         description: User tier upgraded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User tier upgraded successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Next tier not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Next tier not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/upgrade", upgradeTier);

export default router;
