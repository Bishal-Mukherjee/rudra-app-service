import { Request, Response } from "express";
import { hash, compareSync } from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { pool } from "@/config/db";
import { config } from "@/config/config";
import { ONBOARDED, ADMIN, ACTIVE } from "@/constants/constants";
import {
  signinSchema,
  signupSchema,
  resendCodeSchema,
  refreshTokenSchema,
  logoutSchema,
} from "@/controllers/auth/validations";
import { sendCode, verifyCode } from "@/utils/twilio";

export const signup = async (
  req: Request<
    {},
    {},
    {
      name: string;
      phoneNumber: string;
      email?: string;
      gender?: string;
      age?: number;
      occupation?: string;
      expiresIn?: string;
    }
  >,
  res: Response<{
    error?: string;
    message: string;
    result?: {
      accessToken: string;
      refreshToken: string;
      showOnboardingModules: boolean;
    };
  }>,
): Promise<void> => {
  try {
    const { error } = signupSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        error: "Validation error",
        message: error.details[0].message,
      });
      return;
    }

    const { name, phoneNumber, email, gender, age, occupation, expiresIn } =
      req.body;

    const query = await pool.query(
      "SELECT * FROM users WHERE phone_number = $1",
      [phoneNumber],
    );

    if (query.rows.length === 0) {
      res.status(400).json({ message: "User does not exist" });
      return;
    }

    if (query.rows[0].status === "SUSPENDED") {
      res.status(423).json({
        message: "Your account has been suspended by the administrator",
      });
      return;
    }

    const onboardingModulesCountQuery = await pool.query(
      "SELECT COUNT(*) FROM modules WHERE tier = 'ONBOARDING' AND is_active = TRUE",
    );

    const hasOnboardingModules = onboardingModulesCountQuery.rows[0].count > 0;

    const status = hasOnboardingModules ? ONBOARDED : ACTIVE;

    await pool.query(
      "UPDATE users SET name = $1, email = $2, gender = $3, age = $4, occupation = $5, status = $6, last_active_at = NOW() WHERE id = $7",
      [name, email, gender, age, occupation, status, query.rows[0].id],
    ); // TODO: remove the 'status' update after testing

    const accessToken = jwt.sign(
      {
        id: query.rows[0].id,
      },
      config.jwtSecret,
      {
        expiresIn: "1d",
      },
    );

    const refreshToken = crypto.randomBytes(32).toString("hex");
    const refreshTokenHash = await hash(refreshToken, 10);

    // Calculate expiration time - if expiresIn is a number, use minutes, otherwise default to 7 days
    const expiresInMinutes = !isNaN(Number(expiresIn))
      ? Number(expiresIn)
      : 7 * 24 * 60;
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    await pool.query(
      "INSERT INTO refresh_tokens (user_id, token_hash, expires_at, created_at) VALUES ($1, $2, $3, NOW())",
      [query.rows[0].id, refreshTokenHash, expiresAt],
    );

    res.status(201).json({
      message: "User signed up successfully",
      result: {
        accessToken,
        refreshToken,
        showOnboardingModules:
          hasOnboardingModules && query.rows[0].status === ONBOARDED,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to signup user" });
  }
};

export const signin = async (
  req: Request<
    {},
    {},
    {
      phoneNumber: string;
      code: string;
      showOnboardingModules?: boolean;
    }
  >,
  res: Response<{
    error?: string;
    message: string;
    result?: {
      accessToken?: string;
      refreshToken?: string;
      action?: "proceed-with-otp" | "proceed-with-signup";
      showOnboardingModules?: boolean;
    };
  }>,
) => {
  try {
    const { error } = signinSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        error: "Validation error",
        message: error.details[0].message,
      });
      return;
    }

    const { phoneNumber, code } = req.body;

    if (code) {
      // this flow serves the 2nd step of OTP validation
      // after the OTP has been sent, the user will receive it and provide it back

      const query = await pool.query(
        "SELECT id, role, status FROM users WHERE phone_number = $1",
        [phoneNumber],
      );

      if (query.rows[0].role === ADMIN) {
        res.status(403).json({
          message: "Login not allowed for admin accounts",
        });
        return;
      }

      const isValid = await verifyCode(phoneNumber, code);

      if (!isValid) {
        res.status(400).json({ message: "Invalid OTP" });
        return;
      } else {
        const query = await pool.query(
          "SELECT id, name, status FROM users WHERE phone_number = $1",
          [phoneNumber],
        );

        if (query.rows.length === 0) {
          res.status(401).json({ message: "User not found" });
          return;
        }

        if (query.rows[0].status === "SUSPENDED") {
          res.status(423).json({
            message: "Your account has been suspended by the administrator",
          });
          return;
        }

        if (query.rows[0].name === null) {
          res.status(200).json({
            message: "User is already registered. Sign up is pending.",
            result: { action: "proceed-with-signup" },
          });
          return;
        }

        const accessToken = jwt.sign(
          {
            id: query.rows[0].id,
          },
          config.jwtSecret,
          {
            expiresIn: "1d",
          },
        );

        const onboardingModulesCountQuery = await pool.query(
          "SELECT COUNT(*) FROM modules WHERE tier = 'ONBOARDING' AND is_active = TRUE",
        );

        const hasOnboardingModules =
          onboardingModulesCountQuery.rows[0].count > 0;

        const refreshToken = crypto.randomBytes(32).toString("hex");
        const refreshTokenHash = await hash(refreshToken, 10);

        const refreshExpiresInMinutes = 7 * 24 * 60;
        const expiresAt = new Date(
          Date.now() + refreshExpiresInMinutes * 60 * 1000,
        );

        await pool.query(
          "INSERT INTO refresh_tokens (user_id, token_hash, expires_at, created_at) VALUES ($1, $2, $3, NOW())",
          [query.rows[0].id, refreshTokenHash, expiresAt],
        );

        res.status(200).json({
          message: "User signed in successfully",
          result: {
            accessToken,
            refreshToken,
            showOnboardingModules:
              hasOnboardingModules && query.rows[0].status === ONBOARDED,
          },
        });
        return;
      }
    }

    const query = await pool.query(
      "SELECT id, role, status FROM users WHERE phone_number = $1",
      [phoneNumber],
    );

    if (query.rows.length === 0) {
      const response = await sendCode(phoneNumber);

      if (response.status !== "approved" && response.status !== "pending") {
        res.status(500).json({ message: "Failed to send OTP" });
        return;
      }

      // If user is not found, create a new user
      const newUserQuery = await pool.query(
        "INSERT INTO users (phone_number) VALUES ($1) RETURNING *",
        [phoneNumber],
      );

      if (newUserQuery.rows.length === 0) {
        res.status(500).json({ message: "Failed to create user" });
        return;
      }

      res.status(201).json({
        message: "User created successfully",
        result: { action: "proceed-with-otp" },
      });
      return;
    }

    if (query.rows[0].status === "SUSPENDED") {
      res.status(423).json({
        message: "Your account has been suspended by the administrator",
      });
      return;
    }

    if (query.rows[0].role === ADMIN) {
      res.status(403).json({ message: "Login not allowed for admin accounts" });
      return;
    }

    const response = await sendCode(phoneNumber);

    if (response.status !== "approved" && response.status !== "pending") {
      res.status(500).json({ message: "Failed to send OTP" });
      return;
    }

    res.status(200).json({
      message: "OTP sent successfully",
      result: { action: "proceed-with-otp" },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to signin user" });
  }
};

export const resendCode = async (
  req: Request<{}, {}, { phoneNumber: string }>,
  res: Response<{
    message: string;
    error?: string;
  }>,
) => {
  try {
    const { error } = resendCodeSchema.validate(req.body);

    if (error) {
      res.status(400).json({
        error: "Validation error",
        message: error.details[0].message,
      });
      return;
    }

    const { phoneNumber } = req.body;

    const response = await sendCode(phoneNumber);

    if (response.status !== "approved" && response.status !== "pending") {
      res.status(500).json({ message: "Failed to send OTP" });
      return;
    }

    res.status(200).json({ message: "OTP resend successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to resend OTP" });
  }
};

export const refreshToken = async (
  req: Request<{}, {}, { refreshToken: string }>,
  res: Response<{
    message: string;
    error?: string;
    result?: string;
  }>,
) => {
  try {
    const { error } = refreshTokenSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        error: "Validation error",
        message: error.details[0].message,
      });
      return;
    }

    const { refreshToken } = req.body;

    // Find and validate refresh token
    const tokenQuery = await pool.query(
      `SELECT rt.user_id, rt.token_hash, rt.expires_at
       FROM refresh_tokens rt
       WHERE rt.expires_at > NOW() AND rt.is_revoked = FALSE`,
    );

    // Verify token hash matches
    const validToken = tokenQuery.rows.find((row) =>
      compareSync(refreshToken, row.token_hash),
    );

    if (!validToken) {
      res.status(401).json({ message: "Invalid refresh token" });
      return;
    }

    // Generate new access token
    const accessToken = jwt.sign(
      {
        id: validToken.user_id,
      },
      config.jwtSecret,
      {
        expiresIn: "1d",
      },
    );

    // Rotate refresh token for better security
    res
      .status(200)
      .json({ message: "Token refreshed successfully", result: accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to refresh token" });
  }
};

export const logout = async (
  req: Request<{}, {}, { refreshToken: string }>,
  res: Response<{
    message: string;
    error?: string;
  }>,
) => {
  try {
    const { error } = logoutSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        error: "Validation error",
        message: "Invalid access token",
      });
      return;
    }

    const { refreshToken } = req.body;

    const tokenQuery = await pool.query(
      `SELECT rt.user_id, rt.token_hash, rt.expires_at
		 FROM refresh_tokens rt
		 WHERE rt.expires_at > NOW() AND rt.is_revoked = FALSE`,
    );

    const validToken = tokenQuery.rows.find((row) =>
      compareSync(refreshToken, row.token_hash),
    );

    await pool.query("DELETE FROM refresh_tokens WHERE user_id = $1", [
      validToken.user_id,
    ]);

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to logout user" });
  }
};
