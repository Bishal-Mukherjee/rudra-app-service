import express from "express";
import { getModules, getOnboardingModules } from "@/controllers/module";

const router = express.Router();

/**
 * @swagger
 * /module/tier/{tier}:
 *   get:
 *     summary: Get modules by tier
 *     description: Retrieve paginated list of active modules for a specific tier. The authenticated user must have access to the requested tier level (user's tier must be equal or higher). Results are sorted alphabetically by title in English and limited to 10 items per page.
 *     tags: [Module]
 *     parameters:
 *       - in: path
 *         name: tier
 *         required: true
 *         schema:
 *           type: string
 *         description: The tier level to fetch modules for
 *         example: TIER_1
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
 *         description: Modules fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Modules fetched successfully
 *                 result:
 *                   type: array
 *                   description: Array of modules (maximum 10 items per page, sorted alphabetically)
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Unique module identifier
 *                         example: 550e8400-e29b-41d4-a716-446655440000
 *                       title:
 *                         type: object
 *                         properties:
 *                           en:
 *                             type: string
 *                             description: Module title in English
 *                             example: Introduction to Marine Conservation
 *                           bn:
 *                             type: string
 *                             description: Module title in Bengali
 *                             example: সামুদ্রিক সংরক্ষণের ভূমিকা
 *                       description:
 *                         type: object
 *                         properties:
 *                           en:
 *                             type: string
 *                             description: Module description in English
 *                             example: Learn the basics of marine conservation
 *                           bn:
 *                             type: string
 *                             description: Module description in Bengali
 *                             example: সামুদ্রিক সংরক্ষণের মূল বিষয়গুলি শিখুন
 *                       thumbnail:
 *                         type: string
 *                         description: URL of the module thumbnail image
 *                         example: https://example.com/thumbnails/module1.jpg
 *                       url:
 *                         type: string
 *                         description: URL to access the module content
 *                         example: https://example.com/modules/intro-marine-conservation
 *                       tier:
 *                         type: string
 *                         description: Tier level of the module
 *                         example: TIER_1
 *                       type:
 *                         type: string
 *                         description: Type of module (e.g., VIDEO, ARTICLE, QUIZ)
 *                         example: VIDEO
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Module creation timestamp
 *                         example: 2025-01-15T10:30:00Z
 *                       lastUpdatedAt:
 *                         type: string
 *                         format: date-time
 *                         description: Module last update timestamp
 *                         example: 2025-12-10T14:20:00Z
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
 *                       example: 3
 *                     totalRecords:
 *                       type: integer
 *                       description: Total number of modules in this tier
 *                       example: 25
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User's tier level is insufficient to access requested tier
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Forbidden - Access denied
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/tier/:tier", getModules);

/**
 * @swagger
 * /module/onboarding-modules:
 *   get:
 *     summary: Get onboarding modules
 *     description: Retrieve paginated list of active onboarding modules available to all users regardless of tier level. Results are sorted alphabetically by title in English and limited to 10 items per page.
 *     tags: [Module]
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
 *         description: Modules fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Modules fetched successfully
 *                 result:
 *                   type: array
 *                   description: Array of onboarding modules (maximum 10 items per page, sorted alphabetically)
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Unique module identifier
 *                         example: 550e8400-e29b-41d4-a716-446655440000
 *                       title:
 *                         type: object
 *                         properties:
 *                           en:
 *                             type: string
 *                             description: Module title in English
 *                             example: Welcome to RUDRA App
 *                           bn:
 *                             type: string
 *                             description: Module title in Bengali
 *                             example: RUDRA অ্যাপে স্বাগতম
 *                       description:
 *                         type: object
 *                         properties:
 *                           en:
 *                             type: string
 *                             description: Module description in English
 *                             example: Get started with the RUDRA platform
 *                           bn:
 *                             type: string
 *                             description: Module description in Bengali
 *                             example: RUDRA প্ল্যাটফর্ম দিয়ে শুরু করুন
 *                       thumbnail:
 *                         type: string
 *                         description: URL of the module thumbnail image
 *                         example: https://example.com/thumbnails/welcome.jpg
 *                       url:
 *                         type: string
 *                         description: URL to access the module content
 *                         example: https://example.com/modules/welcome
 *                       tier:
 *                         type: string
 *                         description: Tier level of the module (ONBOARDING)
 *                         example: ONBOARDING
 *                       type:
 *                         type: string
 *                         description: Type of module (e.g., VIDEO, ARTICLE, QUIZ)
 *                         example: VIDEO
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Module creation timestamp
 *                         example: 2025-01-01T00:00:00Z
 *                       lastUpdatedAt:
 *                         type: string
 *                         format: date-time
 *                         description: Module last update timestamp
 *                         example: 2025-12-01T10:00:00Z
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
 *                       example: 2
 *                     totalRecords:
 *                       type: integer
 *                       description: Total number of onboarding modules
 *                       example: 15
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/onboarding-modules", getOnboardingModules);

export default router;
