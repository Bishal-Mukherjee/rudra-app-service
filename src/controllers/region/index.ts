import axios from "axios";
import { Request, Response } from "express";
import { redisClient } from "@/config/redis";
import { DistrictBlocks } from "@/controllers/question/types";
import { getStaticLookup } from "@/utils/static-lookup";
import {
  geocodingApiUrl,
  reverseGeocodingApiUrl,
  ALLOWED_STATES,
} from "@/constants/constants";
import { normalizeStateName } from "@/utils/strings";
import { buildReverseGeocodeResult } from "@/controllers/region/helpers";

export const getDistricts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const districts = await getStaticLookup("districts");
    if (districts) {
      res.status(200).json({
        message: "Districts fetched successfully",
        result: districts,
      });
      return;
    }

    res.status(200).json({ message: "No districts found", result: [] });
  } catch (error) {
    console.error("Error fetching districts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getBlocks = async (req: Request, res: Response): Promise<void> => {
  try {
    const blocks = (await getStaticLookup("blocks")) as DistrictBlocks | null;

    const { district } = req.query;

    if (blocks && district && blocks[district as any]) {
      res.status(200).json({
        message: "Blocks fetched successfully",
        result: blocks[district as any],
      });
      return;
    }

    if (blocks) {
      res.status(200).json({
        message: "Blocks fetched successfully",
        result: blocks,
      });
      return;
    }

    res.status(200).json({ message: "No blocks found", result: [] });
  } catch (error) {
    console.error("Error fetching blocks:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getGeocode = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { address } = req.query;

    if (!address) {
      res.status(400).json({ error: "Address is required" });
      return;
    }

    const apiUrl = new URL(geocodingApiUrl);

    apiUrl.searchParams.append("address", address as string);

    const response = await axios.get(apiUrl.toString());

    if (!response?.data?.results) {
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    const state = response.data.results[0]?.address_components?.find(
      (component: { types: string[] }) =>
        component.types.includes("administrative_area_level_1"),
    )?.long_name;

    if (state && !ALLOWED_STATES.includes(normalizeStateName(state))) {
      res
        .status(500)
        .json({ error: `Submission from ${state} is not allowed` });
      return;
    }

    res.status(200).json({
      message: "Location fetched successfully",
      result: {
        lat: response.data.results[0]?.geometry?.location?.lat || null,
        lng: response.data.results[0]?.geometry?.location?.lng || null,
        state: state || null,
      },
    });
  } catch (error) {
    console.error("Error fetching reverse geocode:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getReverseGeocode = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      res.status(400).json({ error: "Latitude and longitude are required" });
      return;
    }

    // TODO: Confirm if rounding is acceptable for the application
    const roundedLat = Number(lat).toFixed(3);
    const roundedLng = Number(lng).toFixed(3);
    const cacheKey = `reverse_geocode:${roundedLat},${roundedLng}`;

    const [districtsData, cachedData] = await Promise.all([
      getStaticLookup("districts"),
      redisClient.get(cacheKey),
    ]);

    if (cachedData) {
      const parsedCachedData = JSON.parse(cachedData);
      const fetchedState = parsedCachedData.state;
      if (
        !ALLOWED_STATES.includes(normalizeStateName(parsedCachedData?.state))
      ) {
        res
          .status(500)
          .json({ error: `Submission from ${fetchedState} is not allowed` });
        return;
      }

      const result = buildReverseGeocodeResult(parsedCachedData, districtsData);
      res
        .status(200)
        .json({ message: "Location fetched successfully", result });
      return;
    }

    const apiUrl = new URL(reverseGeocodingApiUrl);
    apiUrl.searchParams.append("lat", lat as string);
    apiUrl.searchParams.append("lng", lng as string);
    apiUrl.searchParams.append("region", "ind");

    const response = await axios.get(apiUrl.toString());

    if (!response?.data?.results) {
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    const geocodeData = response.data.results[0];

    redisClient.set(
      cacheKey,
      JSON.stringify(geocodeData),
      { EX: 345600 }, // 96 hours
    );

    const result = buildReverseGeocodeResult(geocodeData, districtsData);

    if (
      result?.state &&
      !ALLOWED_STATES.includes(normalizeStateName(result.state))
    ) {
      const fetchedState = result.state;
      res
        .status(500)
        .json({ error: `Submission from ${fetchedState} is not allowed` });
      return;
    }

    res.status(200).json({
      message: "Location fetched successfully",
      result,
    });
  } catch (error) {
    console.error("Error fetching reverse geocode:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
