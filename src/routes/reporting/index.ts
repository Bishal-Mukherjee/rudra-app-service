import express from "express";
import { getAllReportings, postReporting } from "@/controllers/reporting";

const router = express.Router();

/**
 * @swagger
 * /reporting:
 *   get:
 *     summary: Get all reportings
 *     description: Retrieve all reportings submitted by the authenticated user across all types
 *     tags: [Reporting]
 *     responses:
 *       200:
 *         description: Reportings fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reportings fetched successfully
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: 550e8400-e29b-41d4-a716-446655440000
 *                       observedAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-12-15T10:30:00Z
 *                       latitude:
 *                         type: number
 *                         example: 22.5726
 *                       longitude:
 *                         type: number
 *                         example: 88.3639
 *                       district:
 *                         type: string
 *                         example: Kolkata
 *                       block:
 *                         type: string
 *                         example: Block A
 *                       villageOrGhat:
 *                         type: string
 *                         example: Prinsep Ghat
 *                       species:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             type:
 *                               type: string
 *                               example: DOLPHIN
 *                             adult:
 *                               type: object
 *                               properties:
 *                                 stranded:
 *                                   type: integer
 *                                   example: 1
 *                                 injured:
 *                                   type: integer
 *                                   example: 0
 *                                 dead:
 *                                   type: integer
 *                                   example: 0
 *                             adultMale:
 *                               type: object
 *                               properties:
 *                                 stranded:
 *                                   type: integer
 *                                   example: 0
 *                                 injured:
 *                                   type: integer
 *                                   example: 0
 *                                 dead:
 *                                   type: integer
 *                                   example: 0
 *                             adultFemale:
 *                               type: object
 *                               properties:
 *                                 stranded:
 *                                   type: integer
 *                                   example: 0
 *                                 injured:
 *                                   type: integer
 *                                   example: 0
 *                                 dead:
 *                                   type: integer
 *                                   example: 0
 *                             subAdult:
 *                               type: object
 *                               properties:
 *                                 stranded:
 *                                   type: integer
 *                                   example: 0
 *                                 injured:
 *                                   type: integer
 *                                   example: 1
 *                                 dead:
 *                                   type: integer
 *                                   example: 0
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["https://example.com/image1.jpg"]
 *                       type:
 *                         type: string
 *                         example: STRANDING
 *                       submittedAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-12-15T10:35:00Z
 *                       submittedBy:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: John Doe
 *                           phoneNumber:
 *                             type: string
 *                             example: +1234567890
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/", getAllReportings);

/**
 * @swagger
 * /reporting/{type}:
 *   post:
 *     summary: Create a new reporting
 *     description: Submit a new reporting for stranded, injured, or dead marine species. The reporting must include location details, observed time, and species information.
 *     tags: [Reporting]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: The submission context type (e.g., LIVE, OLD)
 *         example: LIVE
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - observedAt
 *               - latitude
 *               - longitude
 *               - state
 *               - species
 *             properties:
 *               observedAt:
 *                 type: string
 *                 format: date-time
 *                 description: Date and time when the incident was observed (ISO 8601 format)
 *                 example: 2025-12-15T10:30:00Z
 *               latitude:
 *                 type: number
 *                 description: Latitude of the incident location (cannot be 0)
 *                 example: 22.5726
 *               longitude:
 *                 type: number
 *                 description: Longitude of the incident location (cannot be 0)
 *                 example: 88.3639
 *               state:
 *                 type: string
 *                 description: State where the incident occurred (must be an allowed state)
 *                 example: West Bengal
 *               species:
 *                 type: array
 *                 minItems: 1
 *                 description: Array of species involved in the incident (minimum 1 required)
 *                 items:
 *                   type: object
 *                   required:
 *                     - type
 *                     - ageGroup
 *                   properties:
 *                     type:
 *                       type: string
 *                       description: Species type
 *                       example: DOLPHIN
 *                     ageGroup:
 *                       type: object
 *                       description: Age group breakdown with status counts
 *                       properties:
 *                         adult:
 *                           type: object
 *                           properties:
 *                             stranded:
 *                               type: integer
 *                               minimum: 0
 *                               example: 1
 *                             injured:
 *                               type: integer
 *                               minimum: 0
 *                               example: 0
 *                             dead:
 *                               type: integer
 *                               minimum: 0
 *                               example: 0
 *                         adultMale:
 *                           type: object
 *                           properties:
 *                             stranded:
 *                               type: integer
 *                               minimum: 0
 *                             injured:
 *                               type: integer
 *                               minimum: 0
 *                             dead:
 *                               type: integer
 *                               minimum: 0
 *                         adultFemale:
 *                           type: object
 *                           properties:
 *                             stranded:
 *                               type: integer
 *                               minimum: 0
 *                             injured:
 *                               type: integer
 *                               minimum: 0
 *                             dead:
 *                               type: integer
 *                               minimum: 0
 *                         subAdult:
 *                           type: object
 *                           properties:
 *                             stranded:
 *                               type: integer
 *                               minimum: 0
 *                             injured:
 *                               type: integer
 *                               minimum: 0
 *                             dead:
 *                               type: integer
 *                               minimum: 0
 *                     cause:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Array of cause identifiers
 *                       example: ["FISHING_NET", "OTHER"]
 *                     otherCause:
 *                       type: string
 *                       nullable: true
 *                       description: Description of other cause if "OTHER" is selected
 *                       example: Hit by boat propeller
 *               district:
 *                 type: string
 *                 description: District where the incident occurred (optional)
 *                 example: Kolkata
 *               block:
 *                 type: string
 *                 description: Block where the incident occurred (optional)
 *                 example: Block A
 *               villageOrGhat:
 *                 type: string
 *                 description: Village or ghat name (optional)
 *                 example: Prinsep Ghat
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of image URLs (optional)
 *                 example: ["https://example.com/image1.jpg"]
 *               notes:
 *                 type: string
 *                 description: Additional notes or observations (optional)
 *                 example: Found near the riverbank
 *     responses:
 *       201:
 *         description: Reporting created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reporting created successfully
 *       400:
 *         description: Validation error or submission from disallowed state
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Validation error
 *                 message:
 *                   type: string
 *                   example: Species must contain at least 1 record
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/:type", postReporting);

export default router;
