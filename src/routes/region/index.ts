import express from "express";
import {
  getBlocks,
  getDistricts,
  getGeocode,
  getReverseGeocode,
} from "@/controllers/region";

const router = express.Router();

/**
 * @swagger
 * /region/districts:
 *   get:
 *     summary: Get all districts
 *     description: Retrieve a list of all available districts from static lookup data
 *     tags: [Region]
 *     responses:
 *       200:
 *         description: Districts fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Districts fetched successfully
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       label:
 *                         type: object
 *                         properties:
 *                           en:
 *                             type: string
 *                             example: Kolkata
 *                           bn:
 *                             type: string
 *                             example: কলকাতা
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/districts", getDistricts);

/**
 * @swagger
 * /region/blocks:
 *   get:
 *     summary: Get blocks
 *     description: Retrieve all blocks or blocks filtered by district. If district query parameter is provided, returns blocks for that specific district only.
 *     tags: [Region]
 *     parameters:
 *       - in: query
 *         name: district
 *         schema:
 *           type: string
 *         required: false
 *         description: District name to filter blocks (optional)
 *         example: Kolkata
 *     responses:
 *       200:
 *         description: Blocks fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Blocks fetched successfully
 *                 result:
 *                   oneOf:
 *                     - type: array
 *                       description: Array of blocks when district parameter is provided
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           label:
 *                             type: object
 *                             properties:
 *                               en:
 *                                 type: string
 *                                 example: Block A
 *                               bn:
 *                                 type: string
 *                                 example: ব্লক এ
 *                     - type: object
 *                       description: Object with district keys when no district parameter is provided
 *                       additionalProperties:
 *                         type: array
 *                         items:
 *                           type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/blocks", getBlocks);

/**
 * @swagger
 * /region/geocode:
 *   get:
 *     summary: Convert address to coordinates
 *     description: Get latitude, longitude, and state information from a text address. Validates that the location is within allowed states for submission.
 *     tags: [Region]
 *     parameters:
 *       - in: query
 *         name: address
 *         schema:
 *           type: string
 *         required: true
 *         description: Address to geocode
 *         example: Prinsep Ghat, Kolkata, West Bengal
 *     responses:
 *       200:
 *         description: Location fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Location fetched successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     lat:
 *                       type: number
 *                       nullable: true
 *                       description: Latitude coordinate
 *                       example: 22.5554
 *                     lng:
 *                       type: number
 *                       nullable: true
 *                       description: Longitude coordinate
 *                       example: 88.3348
 *                     state:
 *                       type: string
 *                       nullable: true
 *                       description: State name
 *                       example: West Bengal
 *       400:
 *         description: Address parameter is missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Address is required
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error or submission from disallowed state
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Submission from Maharashtra is not allowed
 */
router.get("/geocode", getGeocode);

/**
 * @swagger
 * /region/reverse-geocode:
 *   get:
 *     summary: Convert coordinates to address
 *     description: Get address details (district, block, village/ghat, state) from latitude and longitude coordinates. Results are cached for 96 hours with coordinates rounded to 3 decimal places. Validates that the location is within allowed states for submission.
 *     tags: [Region]
 *     parameters:
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         required: true
 *         description: Latitude coordinate
 *         example: 22.5554
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         required: true
 *         description: Longitude coordinate
 *         example: 88.3348
 *     responses:
 *       200:
 *         description: Location fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Location fetched successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     district:
 *                       type: string
 *                       nullable: true
 *                       description: District name
 *                       example: Kolkata
 *                     block:
 *                       type: string
 *                       nullable: true
 *                       description: Block name
 *                       example: Block A
 *                     villageOrGhat:
 *                       type: string
 *                       nullable: true
 *                       description: Village or ghat name
 *                       example: Prinsep Ghat
 *                     state:
 *                       type: string
 *                       nullable: true
 *                       description: State name
 *                       example: West Bengal
 *       400:
 *         description: Missing required latitude or longitude parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Latitude and longitude are required
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error or submission from disallowed state
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Submission from Maharashtra is not allowed
 */
router.get("/reverse-geocode", getReverseGeocode);

export default router;
