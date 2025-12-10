import { Request, Response } from "express";
import { pool } from "@/config/db";

export const getNotifications = async (
  req: Request<any, any, any, { page?: string }>,
  res: Response,
) => {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = 10;
    const offset = (page - 1) * limit;

    const { rows: countRows } = await pool.query(
      "SELECT COUNT(*) FROM notifications WHERE recipient_role = $1",
      ["SIGHTER"],
    );
    const totalRecords = parseInt(countRows[0].count, 10);
    const totalPages = Math.ceil(totalRecords / limit);

    const { rows } = await pool.query(
      `SELECT
	    id,
        title,
        content,
		external_url AS "externalUrl",
        created_at AS "createdAt"
      FROM notifications
      WHERE recipient_role = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3`,
      ["SIGHTER", limit, offset],
    );

    res.status(200).json({
      message: "Notifications fetched successfully",
      result: rows,
      pagination: {
        page,
        totalPages,
        totalRecords,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
