import { SightingReqBody } from "@/controllers/sighting/types";
import { WINDY_OR_STORMY } from "@/constants/constants";

export const prepareSightingData = (body: SightingReqBody) => {
  const weatherCondition = [body.weatherCondition];
  if (body.hasWindyOrStormyWeather === "YES") {
    weatherCondition.push(WINDY_OR_STORMY);
  }

  const waterBody = [body.channelType, body.waterBody];

  return { weatherCondition, waterBody };
};
