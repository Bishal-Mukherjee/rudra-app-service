import { Request, Response } from "express";
import { pool } from "@/config/db";
import { Sighting, SightingReqBody } from "@/controllers/sighting/types";
import { postSightingSchema } from "@/controllers/sighting/validations";
import { ALLOWED_STATES } from "@/constants/constants";
import { normalizeStateName } from "@/utils/strings";

export const postSighting = async (req: Request, res: Response) => {
  const { error } = postSightingSchema.validate(req.body);

  if (error) {
    res
      .status(400)
      .json({ error: "Validation error", message: error.details[0].message });
    return;
  }

  if (!ALLOWED_STATES.includes(normalizeStateName(req.body.state))) {
    const fetchedState = req.body.state;
    res
      .status(400)
      .json({ error: `Submission from ${fetchedState} is not allowed` });
    return;
  }

  const client = await pool.connect();

  try {
    const { id } = req.user;
    const { type } = req.params;
    const body = req.body as SightingReqBody;

    await client.query("BEGIN");

    const query = await client.query(
      `INSERT INTO sightings (submitted_by, observed_at, latitude, longitude, 
      village_or_ghat, district, block, state, water_body_condition, weather_condition,
       water_body, threats, fishing_gears, images, notes, submission_context) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING id`,
      [
        id,
        body.observedAt,
        body.latitude,
        body.longitude,
        body.villageOrGhat,
        body.district,
        body.block,
        body.state,
        body.waterBodyCondition,
        body.weatherCondition,
        body.waterBody,
        body.threats,
        body.fishingGears || [],
        body.images || [],
        body.notes,
        type,
      ],
    );

    const sightingId = query.rows[0]?.id;

    if (!sightingId) {
      throw new Error("Failed to create sighting record");
    }

    const species = body.species || [];

    if (species.length > 0) {
      await Promise.all(
        species.map(async (spec) => {
          const { adult, adultMale, adultFemale, subAdult } =
            spec.ageGroup || {};

          return client.query(
            `INSERT INTO sighting_species (sighting_id, species, adult, sub_adult, adult_male, adult_female) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              sightingId,
              spec.type,
              adult || 0,
              subAdult || 0,
              adultMale || 0,
              adultFemale || 0,
            ],
          );
        }),
      );
    }

    await client.query("COMMIT");

    res.status(201).json({ message: "Sighting created successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Failed to create sighting" });
  } finally {
    client.release();
  }
};

export const getAllSightings = async (req: Request, res: Response) => {
  try {
    const { id } = req.user;

    const speciesQuery = await pool.query(
      "SELECT value, age_group FROM species",
    );
    const speciesMap = new Map();

    speciesQuery.rows.forEach((species) => {
      speciesMap.set(species.value, species.age_group);
    });

    const query = await pool.query(
      `SELECT json_agg(
         json_build_object(
           'id', o.id,
           'observedAt', o.observed_at,
           'latitude', o.latitude,
           'longitude', o.longitude,
           'waterBody', o.water_body,
           'waterBodyCondition', o.water_body_condition,
           'weatherCondition', o.weather_condition,
           'villageOrGhat', o.village_or_ghat,
           'district', o.district,
           'block', o.block,
           'threats', o.threats,
           'fishingGears', o.fishing_gears,
           'species', (
             SELECT json_agg(
               json_build_object(
                 'type', os.species,
                 'adult', os.adult,
                 'subAdult', os.sub_adult,
                 'adultMale', os.adult_male,
                 'adultFemale', os.adult_female
               )
             )
             FROM sighting_species os
             WHERE os.sighting_id = o.id
           ),
           'images', o.images,
           'notes', o.notes,
           'type', o.submission_context,
           'submittedAt', o.submitted_at,
           'submittedBy', json_build_object(
             'name', u.name,
             'phoneNumber', u.phone_number
           )
         )
       ) AS results
       FROM sightings o
       JOIN users u ON o.submitted_by = u.id
       WHERE o.submitted_by = $1
       GROUP BY o.id, u.name, u.phone_number, o.submitted_at
       ORDER BY o.submitted_at DESC
       `,
      [id],
    );

    const sightings = query.rows[0]?.results?.map((sighting: Sighting) => {
      const sightingSpecies = sighting.species.map((spec) => {
        if (speciesMap.get(spec.type) === "duo") {
          return {
            type: spec.type,
            adult: spec.adult || 0,
            subAdult: spec.subAdult || 0,
          };
        }
        return {
          type: spec.type,
          adultMale: spec.adultMale || 0,
          adultFemale: spec.adultFemale || 0,
          subAdult: spec.subAdult || 0,
        };
      });

      return {
        ...sighting,
        species: sightingSpecies,
      };
    });

    res.status(200).json({
      message: "Sightings retrieved successfully",
      result: sightings || [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve sightings" });
  }
};

export const getSightingsByType = async (req: Request, res: Response) => {
  try {
    const { id } = req.user;
    const { type } = req.params;

    const speciesQuery = await pool.query(
      "SELECT value, age_group FROM species",
    );
    const speciesMap = new Map();

    speciesQuery.rows.forEach((species) => {
      speciesMap.set(species.value, species.age_group);
    });

    const query = await pool.query(
      `SELECT json_agg(
         json_build_object(
           'id', o.id,
           'observedAt', o.observed_at,
           'latitude', o.latitude,
           'longitude', o.longitude,
           'waterBody', o.water_body,
           'waterBodyCondition', o.water_body_condition,
           'weatherCondition', o.weather_condition,
           'villageOrGhat', o.village_or_ghat,
           'district', o.district,
           'block', o.block,
           'threats', o.threats,
           'fishingGears', o.fishing_gears,
           'species', (
             SELECT json_agg(
               json_build_object(
                 'type', os.species,
                 'adult', os.adult,
                 'subAdult', os.sub_adult,
                 'adultMale', os.adult_male,
                 'adultFemale', os.adult_female
               )
             )
             FROM sighting_species os
             WHERE os.sighting_id = o.id
           ),
           'images', o.images,
           'notes', o.notes,
           'submittedAt', o.submitted_at,
           'submittedBy', json_build_object(
             'name', u.name,
             'phoneNumber', u.phone_number
           )
         )
       ) AS results
       FROM sightings o
       JOIN users u ON o.submitted_by = u.id
       WHERE o.submitted_by = $1 AND o.submission_context = $2
	   GROUP BY o.id, u.name, u.phone_number, o.submitted_at
	   ORDER BY o.submitted_at DESC
	   `,
      [id, type],
    );

    const sightings = query.rows[0]?.results?.map((sighting: Sighting) => {
      const sightingSpecies = sighting.species.map((spec) => {
        if (speciesMap.get(spec.type) === "duo") {
          return {
            type: spec.type,
            adult: spec.adult || 0,
            subAdult: spec.subAdult || 0,
          };
        }
        return {
          type: spec.type,
          adultMale: spec.adultMale || 0,
          adultFemale: spec.adultFemale || 0,
          subAdult: spec.subAdult || 0,
        };
      });

      return {
        ...sighting,
        species: sightingSpecies,
      };
    });

    res.status(200).json({
      message: "Sightings retrieved successfully",
      result: sightings || [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve sightings" });
  }
};
