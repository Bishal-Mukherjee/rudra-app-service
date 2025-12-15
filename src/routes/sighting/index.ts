import express from "express";
import { getAllSightings, postSighting } from "@/controllers/sighting";

const router = express.Router();

/**
 * @swagger
 * /sighting:
 *   get:
 *     summary: Get all sightings
 *     description: Retrieve all sightings submitted by the authenticated user with complete details including species, environmental conditions, threats, and location information. Species data is formatted based on their age group classification (duo or trio).
 *     tags: [Sighting]
 *     responses:
 *       200:
 *         description: Sightings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Sightings retrieved successfully
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
 *                       waterBody:
 *                         type: string
 *                         example: RIVER
 *                       waterBodyCondition:
 *                         type: string
 *                         example: CALM
 *                       weatherCondition:
 *                         type: string
 *                         example: SUNNY
 *                       villageOrGhat:
 *                         type: string
 *                         example: Prinsep Ghat
 *                       district:
 *                         type: string
 *                         example: Kolkata
 *                       block:
 *                         type: string
 *                         example: Block A
 *                       threats:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["FISHING_NET", "POLLUTION"]
 *                       fishingGears:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["GILL_NET"]
 *                       species:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             type:
 *                               type: string
 *                               example: GANGES_DOLPHIN
 *                             adult:
 *                               type: integer
 *                               description: Adult count (for duo classification)
 *                               example: 2
 *                             subAdult:
 *                               type: integer
 *                               description: Sub-adult count
 *                               example: 1
 *                             adultMale:
 *                               type: integer
 *                               description: Adult male count (for trio classification)
 *                               example: 1
 *                             adultFemale:
 *                               type: integer
 *                               description: Adult female count (for trio classification)
 *                               example: 1
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["https://example.com/image1.jpg"]
 *                       notes:
 *                         type: string
 *                         example: Dolphins were swimming peacefully
 *                       type:
 *                         type: string
 *                         example: GENERAL
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
 *         description: Failed to retrieve sightings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to retrieve sightings
 */
router.get("/", getAllSightings);

/**
 * @swagger
 * /sighting/{type}:
 *   post:
 *     summary: Create a new sighting
 *     description: Submit a new marine life sighting with environmental conditions, location details, species information, and potential threats. The sighting must include water body conditions, weather information, and at least one species observation.
 *     tags: [Sighting]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: The submission context type (e.g., LIVE, OLD)
 *         example: OLD
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
 *               - waterBodyCondition
 *               - weatherCondition
 *               - hasWindyOrStormyWeather
 *               - channelType
 *               - waterBody
 *               - threats
 *             properties:
 *               observedAt:
 *                 type: string
 *                 format: date-time
 *                 description: Date and time when the sighting occurred (ISO 8601 format)
 *                 example: 2025-12-15T10:30:00Z
 *               latitude:
 *                 type: number
 *                 description: Latitude of the sighting location (cannot be 0)
 *                 example: 22.5726
 *               longitude:
 *                 type: number
 *                 description: Longitude of the sighting location (cannot be 0)
 *                 example: 88.3639
 *               state:
 *                 type: string
 *                 description: State where the sighting occurred (must be an allowed state)
 *                 example: West Bengal
 *               species:
 *                 type: array
 *                 minItems: 1
 *                 description: Array of species observed (minimum 1 required)
 *                 items:
 *                   type: object
 *                   required:
 *                     - type
 *                     - ageGroup
 *                   properties:
 *                     type:
 *                       type: string
 *                       description: Species type identifier
 *                       example: GANGES_DOLPHIN
 *                     ageGroup:
 *                       type: object
 *                       description: Age group counts for the observed species
 *                       properties:
 *                         adult:
 *                           type: integer
 *                           minimum: 0
 *                           description: Number of adults (for duo classification)
 *                           example: 2
 *                         subAdult:
 *                           type: integer
 *                           minimum: 0
 *                           description: Number of sub-adults
 *                           example: 1
 *                         adultMale:
 *                           type: integer
 *                           minimum: 0
 *                           description: Number of adult males (for trio classification)
 *                           example: 1
 *                         adultFemale:
 *                           type: integer
 *                           minimum: 0
 *                           description: Number of adult females (for trio classification)
 *                           example: 1
 *               waterBodyCondition:
 *                 type: string
 *                 description: Condition of the water body
 *                 example: CALM
 *               weatherCondition:
 *                 type: string
 *                 description: Weather condition during observation
 *                 example: SUNNY
 *               hasWindyOrStormyWeather:
 *                 type: string
 *                 description: Indicates if weather was windy or stormy (YES/NO)
 *                 example: NO
 *               channelType:
 *                 type: string
 *                 description: Type of water body channel
 *                 example: MAIN_CHANNEL
 *               waterBody:
 *                 type: string
 *                 description: Type of water body
 *                 example: RIVER
 *               threats:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of threat identifiers observed
 *                 example: ["FISHING_NET", "POLLUTION"]
 *               district:
 *                 type: string
 *                 description: District where the sighting occurred (optional)
 *                 example: Kolkata
 *               block:
 *                 type: string
 *                 description: Block where the sighting occurred (optional)
 *                 example: Block A
 *               villageOrGhat:
 *                 type: string
 *                 description: Village or ghat name (optional)
 *                 example: Prinsep Ghat
 *               fishingGears:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of fishing gear identifiers observed (optional)
 *                 example: ["GILL_NET", "TRAWL_NET"]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of image URLs (optional)
 *                 example: ["https://example.com/image1.jpg"]
 *               notes:
 *                 type: string
 *                 description: Additional notes or observations (optional)
 *                 example: Dolphins were swimming near the shore
 *     responses:
 *       201:
 *         description: Sighting created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Sighting created successfully
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
 *         description: Failed to create sighting
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to create sighting
 */
router.post("/:type", postSighting);

export default router;
