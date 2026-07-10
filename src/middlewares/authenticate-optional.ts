import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { pool } from "@/config/db";
import { config } from "@/config/config";
import { SIGHTER } from "@/constants/constants";

const UNKNOWN_USER_ID = "Unknown";

// Same as `authenticate`, but when no token is provided it attaches
// `req.user.id = "Unknown"` and continues instead of rejecting the request.
export const authenticateOptional = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = { id: UNKNOWN_USER_ID, phone_number: "", access_token: "" };
    next();
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;

    if (!decoded) {
      res.status(401).json({ message: "Unauthorized: Invalid token" });
      return;
    }

    const result = await pool.query(
      "SELECT id, phone_number, status FROM users WHERE id = $1 AND role = $2",
      [decoded.id, SIGHTER],
    );

    if (result.rows.length === 0) {
      res.status(401).json({ message: "Unauthorized: Invalid token" });
      return;
    }

    const userStatus = result.rows[0].status;

    if (userStatus === "SUSPENDED") {
      res.status(423).json({
        message: "Your account has been suspended by the administrator",
      });
      return;
    }

    await pool.query("UPDATE users SET last_active_at = $1 WHERE id = $2", [
      new Date(),
      decoded.id,
    ]);

    req.user = {
      id: result.rows[0].id,
      phone_number: result.rows[0].phone_number,
      access_token: token,
    };
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
