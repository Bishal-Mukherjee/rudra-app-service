import { Request, Response } from "express";
import { pool } from "@/config/db";
import { Species, SpeciesCause } from "@/controllers/species/types";
import { getStaticLookup } from "@/utils/static-lookup";

export const getSpecies = async (req: Request, res: Response) => {
  try {
    const speciesCauses = (await getStaticLookup(
      "species_causes",
    )) as unknown as SpeciesCause[];

    const speciesQuery = await pool.query(`
        SELECT json_agg(
          json_build_object(
            'label', json_build_object('en', label_en, 'bn', label_bn),
            'value', value,
            'image', image,
			'subAdultImage', sub_adult_image,
            'ageGroup', age_group,
            'lastUpdatedAt', last_updated_at
          )
        ) AS species
        FROM species WHERE is_active = true
      `);

    const speciesData: Species[] = speciesQuery.rows[0]?.species || [];

    const mergedData = speciesData
      .map((species: Species) => {
        return {
          ...species,
          causes: speciesCauses
            ? speciesCauses.find(
                (cause: SpeciesCause) => cause.species === species.value,
              )?.causalities
            : undefined,
        };
      })
      .sort((a, b) => a.label.en.localeCompare(b.label.en));

    res.status(200).json({
      message: "Species retrieved successfully",
      result: mergedData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve species" });
  }
};
