import { UNKNOWN } from "@/constants/constants";
import { findBestMatch } from "@/utils/strings";

export const buildReverseGeocodeResult = (
  geocodeData: {
    district?: string;
    subDistrict?: string;
    formatted_address?: string;
	state?: string;
  } | null,
  districtsData: any[],
) => {
  const matchedDistrict = findBestMatch(
    geocodeData?.district as string,
    districtsData,
  );

  const district =
    matchedDistrict.percentage > 20 ? matchedDistrict.value : UNKNOWN;
  const block = geocodeData?.subDistrict
    ? String(geocodeData.subDistrict).split(" ").join("_").toUpperCase()
    : UNKNOWN;

  return {
    block,
    district,
    formattedAddress: geocodeData?.formatted_address || null,
	state: geocodeData?.state || null,
  };
};
