import express from "express";
import {
  signin,
  signup,
  resendCode,
  refreshToken,
  logout,
} from "@/controllers/auth";

const router = express.Router();

/**
 * @swagger
 * /auth/signin:
 *   post:
 *     summary: Sign in user with phone number and OTP
 *     description: Two-step authentication process - first send phone number to receive OTP, then send phone number with OTP to complete signin
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: User's phone number with country code
 *                 example: +1234567890
 *               code:
 *                 type: string
 *                 description: OTP code (required for second step)
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP sent successfully or user signed in successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: OTP sent successfully
 *                     result:
 *                       type: object
 *                       properties:
 *                         action:
 *                           type: string
 *                           enum: [proceed-with-otp, proceed-with-signup]
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: User signed in successfully
 *                     result:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                         refreshToken:
 *                           type: string
 *                         showOnboardingModules:
 *                           type: boolean
 *       201:
 *         description: New user created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     action:
 *                       type: string
 *                       example: proceed-with-otp
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         description: User not found
 *       403:
 *         description: Login not allowed for admin accounts
 *       423:
 *         description: Account suspended
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/signin", signin);

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Complete user signup
 *     description: Complete the signup process by providing user details after OTP verification
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phoneNumber
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *                 example: John Doe
 *               phoneNumber:
 *                 type: string
 *                 description: User's phone number with country code
 *                 example: +1234567890
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address (optional)
 *                 example: john.doe@example.com
 *               gender:
 *                 type: string
 *                 description: User's gender (optional)
 *                 example: Male
 *               age:
 *                 type: integer
 *                 description: User's age (optional)
 *                 example: 25
 *               occupation:
 *                 type: string
 *                 description: User's occupation (optional)
 *                 example: Marine Biologist
 *     responses:
 *       201:
 *         description: User signed up successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User signed up successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: JWT access token
 *                     refreshToken:
 *                       type: string
 *                       description: Refresh token for obtaining new access tokens
 *                     showOnboardingModules:
 *                       type: boolean
 *                       description: Whether to show onboarding modules
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       423:
 *         description: Account suspended
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Your account has been suspended by the administrator
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/signup", signup);

/**
 * @swagger
 * /auth/resend:
 *   post:
 *     summary: Resend OTP code
 *     description: Resend OTP verification code to the user's phone number
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: User's phone number with country code
 *                 example: +1234567890
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP resend successfully
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/resend", resendCode);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     description: Get a new access token using a valid refresh token
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Valid refresh token
 *                 example: abc123def456...
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Token refreshed successfully
 *                 result:
 *                   type: string
 *                   description: New access token
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         description: Invalid refresh token
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/refresh-token", refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Invalidate the user's refresh token and logout
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: User's refresh token
 *                 example: abc123def456...
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/logout", logout);

export default router;
