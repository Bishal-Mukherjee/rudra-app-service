import { Request, Response } from "express";
import { pool } from "@/config/db";

export const getTiers = async (req: Request, res: Response) => {
  try {
    const { id } = req.user;

    const { rows: userQuery } = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [id],
    );

    const { tier: userTier } = userQuery[0];

    const { rows: countRows } = await pool.query("SELECT COUNT(*) FROM tiers");

    const tierQuery = await pool.query(
      `SELECT t.id, t.title_en, t.title_bn, t.description_en, t.description_bn, 
              t.tier, t.created_at, t.last_updated_at,
              COALESCE(m.modules, 0) AS modules
       FROM tiers t
       LEFT JOIN (
         SELECT tier, COUNT(*) AS modules
         FROM modules
         WHERE is_active = true
         GROUP BY tier
       ) m ON t.tier = m.tier
       WHERE t.is_active = true;`,
    );

    if (tierQuery.rows.length === 0) {
      res.status(200).json({
        message: "Tiers fetched successfully",
        result: { tiers: [], finalTier: "TIER_1" },
      });
      return;
    }

    const tiers = tierQuery.rows.map((tier) => ({
      id: tier.id,
      title: {
        en: tier.title_en,
        bn: tier.title_bn,
      },
      description: {
        en: tier.description_en,
        bn: tier.description_bn,
      },
      tier: tier.tier,
      modules: tier.modules,
      createdAt: tier.created_at,
      lastUpdatedAt: tier.last_updated_at,
    }));

    const accessibleTiers = tiers
      .filter((tier) => tier.tier.localeCompare(userTier) <= 0)
      .sort((a, b) => b.tier.localeCompare(a.tier));

    const finalTierValue = countRows[0]?.count
      ? `TIER_${countRows[0].count}`
      : "TIER_1";

    res.status(200).json({
      message: "Tiers fetched successfully",
      result: { tiers: accessibleTiers, finalTier: finalTierValue },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

