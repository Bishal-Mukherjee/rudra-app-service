import express from "express";
import { getSpecies } from "@/controllers/species";

const router = express.Router();

/**
 * @swagger
 * /species:
 *   get:
 *     summary: Get all active species
 *     description: Retrieve all active species with their details including labels in English and Bengali, images for different age groups, age group classification, and associated causes with consequences.
 *     tags: [Species]
 *     responses:
 *       200:
 *         description: Species retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Species retrieved successfully
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       label:
 *                         type: object
 *                         properties:
 *                           en:
 *                             type: string
 *                             description: Species name in English
 *                             example: Ganges River Dolphin
 *                           bn:
 *                             type: string
 *                             description: Species name in Bengali
 *                             example: গাঙ্গেয় নদী ডলফিন
 *                       value:
 *                         type: string
 *                         description: Unique identifier for the species
 *                         example: GANGES_DOLPHIN
 *                       image:
 *                         type: string
 *                         description: URL of the general species image
 *                         example: https://example.com/images/ganges-dolphin.jpg
 *                       adultMaleImage:
 *                         type: string
 *                         description: URL of the adult male image
 *                         example: https://example.com/images/adult-male-dolphin.jpg
 *                       adultFemaleImage:
 *                         type: string
 *                         description: URL of the adult female image
 *                         example: https://example.com/images/adult-female-dolphin.jpg
 *                       subAdultImage:
 *                         type: string
 *                         description: URL of the sub-adult image
 *                         example: https://example.com/images/sub-adult-dolphin.jpg
 *                       ageGroup:
 *                         type: string
 *                         description: Age group classification type (e.g., 'duo', 'trio')
 *                         example: trio
 *                       lastUpdatedAt:
 *                         type: string
 *                         format: date-time
 *                         description: Timestamp of last update
 *                         example: 2025-12-15T10:30:00Z
 *                       causes:
 *                         type: array
 *                         description: Array of possible causes/threats to this species
 *                         items:
 *                           type: object
 *                           properties:
 *                             label:
 *                               type: object
 *                               properties:
 *                                 en:
 *                                   type: string
 *                                   description: Cause name in English
 *                                   example: Fishing net entanglement
 *                                 bn:
 *                                   type: string
 *                                   description: Cause name in Bengali
 *                                   example: মাছ ধরার জালে জড়িয়ে যাওয়া
 *                             value:
 *                               type: string
 *                               description: Unique identifier for the cause
 *                               example: FISHING_NET
 *                             image:
 *                               type: string
 *                               description: URL of the cause image
 *                               example: https://example.com/images/fishing-net.jpg
 *                             consequences:
 *                               type: array
 *                               description: Array of possible consequences
 *                               items:
 *                                 type: string
 *                               example: ["INJURY", "DEATH", "STRANDING"]
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Failed to retrieve species
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to retrieve species
 */
router.get("/", getSpecies);

export default router;
