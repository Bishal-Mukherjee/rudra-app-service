import express from "express";
import { getAllQuestions } from "@/controllers/question";

const router = express.Router();

/**
 * @swagger
 * /questions/{type}:
 *   get:
 *     summary: Get all questions by type
 *     description: Retrieve all questions for a specific context type (reporting or sighting). Returns cached data if available, otherwise fetches from database and caches for 7 days.
 *     tags: [Question]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [reporting, sighting, REPORTING, SIGHTING]
 *         description: The type of questions to retrieve (case-insensitive)
 *         example: reporting
 *     responses:
 *       200:
 *         description: Questions fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reporting questions fetched successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     questions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           topic:
 *                             type: string
 *                             description: Question topic/category
 *                             example: location
 *                           label:
 *                             type: object
 *                             properties:
 *                               en:
 *                                 type: string
 *                                 description: Question label in English
 *                                 example: What is the location?
 *                               bn:
 *                                 type: string
 *                                 description: Question label in Bengali
 *                                 example: অবস্থান কি?
 *                           type:
 *                             type: string
 *                             description: Question type (e.g., text, select, multi-select)
 *                             example: text
 *                           isOptional:
 *                             type: boolean
 *                             description: Whether the question is optional
 *                             example: false
 *                           optionKey:
 *                             type: string
 *                             description: Key for question options (if applicable)
 *                             example: threats
 *                           options:
 *                             type: array
 *                             description: Available options for the question (if applicable)
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                   example: 1
 *                                 label:
 *                                   type: object
 *                                   properties:
 *                                     en:
 *                                       type: string
 *                                       example: Fishing nets
 *                                     bn:
 *                                       type: string
 *                                       example: মাছ ধরার জাল
 *                     speciesAgeGroups:
 *                       type: array
 *                       description: Available age groups for species
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
 *                                 example: Adult
 *                               bn:
 *                                 type: string
 *                                 example: প্রাপ্তবয়স্ক
 *       400:
 *         description: Invalid question type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid question type
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/:type", getAllQuestions);

export default router;
