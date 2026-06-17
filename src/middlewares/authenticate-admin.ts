import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { pool } from "@/config/db";
import { config } from "@/config/config";
import { ADMIN } from "@/constants/constants";

interface User {
  id: string;
  phone_number: string;
  access_token: string;
}

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

export const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized: Missing or invalid token" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;

    if (!decoded) {
      res.status(401).json({ message: "Unauthorized: Invalid token" });
      return;
    }

    // Verify the user exists in the database
    const result = await pool.query(
      "SELECT id, phone_number, status FROM users WHERE id = $1 AND role = $2",
      [decoded.id, ADMIN],
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

    const user: User = {
      id: result.rows[0].id,
      phone_number: result.rows[0].phone_number,
      access_token: token,
    };

    // Attach the user object to the request
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Unauthorized: Invalid token" });
    return;
  }
};
