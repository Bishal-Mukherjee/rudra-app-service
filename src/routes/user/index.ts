import express from "express";
import { getUserDetails, updateActivateUser } from "@/controllers/user";

const router = express.Router();

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get user details
 *     description: Retrieve complete details of the authenticated user including personal information, role, tier, status, and configuration data with last updated timestamps for various system entities (questions, species, tiers, modules, notifications).
 *     tags: [User]
 *     responses:
 *       200:
 *         description: User details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User details fetched successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Unique user identifier
 *                       example: 550e8400-e29b-41d4-a716-446655440000
 *                     name:
 *                       type: string
 *                       description: User's full name
 *                       example: John Doe
 *                     age:
 *                       type: integer
 *                       nullable: true
 *                       description: User's age
 *                       example: 25
 *                     phoneNumber:
 *                       type: string
 *                       description: User's phone number with country code
 *                       example: +1234567890
 *                     email:
 *                       type: string
 *                       format: email
 *                       nullable: true
 *                       description: User's email address
 *                       example: john.doe@example.com
 *                     gender:
 *                       type: string
 *                       nullable: true
 *                       description: User's gender
 *                       example: Male
 *                     role:
 *                       type: string
 *                       description: User's role in the system
 *                       example: USER
 *                     tier:
 *                       type: string
 *                       description: User's current tier level
 *                       example: TIER_1
 *                     status:
 *                       type: string
 *                       description: User's account status
 *                       example: ACTIVE
 *                     occupation:
 *                       type: string
 *                       nullable: true
 *                       description: User's occupation
 *                       example: Marine Biologist
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Account creation timestamp
 *                       example: 2025-01-15T10:30:00Z
 *                     lastActiveAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       description: Last activity timestamp
 *                       example: 2025-12-15T10:30:00Z
 *                 config:
 *                   type: object
 *                   description: System configuration and metadata
 *                   properties:
 *                     lastUpdatedAt:
 *                       type: object
 *                       description: Timestamps of last updates for various entities
 *                       properties:
 *                         questions:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *                           description: Last update time for questions
 *                           example: 2025-12-10T08:00:00Z
 *                         species:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *                           description: Last update time for species
 *                           example: 2025-12-12T14:30:00Z
 *                         tier:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *                           description: Last update time for tiers
 *                           example: 2025-12-05T09:15:00Z
 *                         modules:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *                           description: Last update time for modules
 *                           example: 2025-12-08T11:45:00Z
 *                         notifications:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *                           description: Last notification time for user's role
 *                           example: 2025-12-15T07:20:00Z
 *                     supportEmail:
 *                       type: string
 *                       description: Support contact email addresses
 *                       example: support@sample.com, support2@sample.com, support3@sample.com
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/", getUserDetails);

/**
 * @swagger
 * /user/activate:
 *   put:
 *     summary: Activate user account
 *     description: Change the authenticated user's status to ACTIVE. If the user is already active, returns a success message without making changes.
 *     tags: [User]
 *     responses:
 *       200:
 *         description: User activated successfully or already activated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User activated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put("/activate", updateActivateUser);

export default router;
