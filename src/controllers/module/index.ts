import { Request, Response } from "express";
import { pool } from "@/config/db";

export const getModules = async (
  req: Request<{ tier: string }, any, any, { page?: string }>,
  res: Response,
) => {
  try {
    const { id } = req.user;
    const { tier } = req.params;
    const page = parseInt(req.query.page || "1", 10);
    const limit = 10;
    const offset = (page - 1) * limit;

    const { rows: userQuery } = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [id],
    );

    const isTierAccessible = userQuery[0].tier.localeCompare(tier) >= 0;

    if (!isTierAccessible) {
      res.status(403).json({ message: "Forbidden: Access denied" });
      return;
    }

    const { rows: countRows } = await pool.query(
      "SELECT COUNT(*) FROM modules WHERE tier = $1 AND is_active = true",
      [tier],
    );
    const totalRecords = parseInt(countRows[0].count, 10);
    const totalPages = Math.ceil(totalRecords / limit);

    const { rows: modulesQuery } = await pool.query(
      `SELECT json_agg (json_build_object(
         'id', id,
		 'index', index,
         'title', json_build_object(
            'en', title_en,
            'bn', title_bn
          ),
         'description', json_build_object(
            'en', description_en,
            'bn', description_bn
          ),
        'thumbnail', thumbnail,
        'url', url,
         'tier', tier,
        'type', type,
         'createdAt', created_at,
        'lastUpdatedAt', last_updated_at
       )) AS result FROM (
         SELECT * FROM modules WHERE tier = $1 AND is_active = true
		 ORDER BY index ASC
         LIMIT $2 OFFSET $3
       ) AS paged_modules;`,
      [tier, limit, offset],
    );

    if (!modulesQuery[0].result) {
      res.status(200).json({
        message: "Modules fetched successfully",
        result: [],
        pagination: { page, totalPages, totalRecords },
      });
      return;
    }

    const fetchedModules = modulesQuery[0]?.result || [];

    res.status(200).json({
      message: "Modules fetched successfully",
      result: fetchedModules,
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

export const getOnboardingModules = async (
  req: Request<any, any, any, { page?: string }>,
  res: Response,
) => {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = 10;
    const offset = (page - 1) * limit;

    const { rows: countRows } = await pool.query(
      "SELECT COUNT(*) FROM modules WHERE tier = $1 AND is_active = true",
      ["ONBOARDING"],
    );
    const totalRecords = parseInt(countRows[0].count, 10);
    const totalPages = Math.ceil(totalRecords / limit);

    if (totalRecords === 0) {
      res.status(200).json({
        message: "Modules fetched successfully",
        result: [],
        pagination: { page: 1, totalPages: 0, totalRecords: 0 },
      });
      return;
    }

    const { rows: modulesQuery } = await pool.query(
      `SELECT json_agg (json_build_object(
         'id', id,
         'title', json_build_object(
            'en', title_en,
            'bn', title_bn
          ),
         'description', json_build_object(
            'en', description_en,
            'bn', description_bn
          ),
         'thumbnail', thumbnail,
         'url', url,
         'tier', tier,
         'type', type,
         'createdAt', created_at,
        'lastUpdatedAt', last_updated_at
       )) AS result FROM (
         SELECT * FROM modules WHERE tier = $1 AND is_active = true
         LIMIT $2 OFFSET $3
       ) AS paged_modules;`,
      ["ONBOARDING", limit, offset],
    );

    const sortedResults = modulesQuery[0].result.sort(
      (a: { title: { en: string } }, b: { title: { en: string } }) => {
        return a.title.en.localeCompare(b.title.en);
      },
    );

    res.status(200).json({
      message: "Modules fetched successfully",
      result: sortedResults,
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
