import { config } from "@/config/config";

export const speciesAgeGroups = {
  duo: [
    {
      label: { en: "Adults", bn: "Adults" },
      value: "adult",
    },
    {
      label: { en: "Calves", bn: "Calves" },
      value: "subAdult",
    },
    // {
    //   label: { en: "Unidentified", bn: "Unidentified" },
    //   value: "unidentified",
    // },
  ],
  trio: [
    {
      label: { en: "Adult Male", bn: "Adult Male" },
      value: "adultMale",
    },
    {
      label: { en: "Adult Female", bn: "Adult Female" },
      value: "adultFemale",
    },
    {
      label: { en: "Sub-Adults/Juveniles", bn: "Sub-Adults/Juveniles" },
      value: "subAdult",
    },
    {
      label: { en: "Unidentified", bn: "Unidentified" },
      value: "unidentified",
    },
  ],
} as const;

export const confirmationOptions = [
  {
    label: {
      en: "Yes",
      bn: "Yes",
    },
    value: "YES",
  },
  {
    label: {
      en: "No",
      bn: "No",
    },
    value: "NO",
  },
];

export const LIVE_REPORTING = "LIVE_REPORTING",
  LIVE_SIGHTING = "LIVE_SIGHTING",
  UNKNOWN = "UNKNOWN",
  ONBOARDED = "ONBOARDED",
  ACTIVE = "ACTIVE",
  ADMIN = "ADMIN",
  SIGHTER = "SIGHTER",
  WINDY_OR_STORMY = "WINDY_OR_STORMY";

export const geocodingApiUrl = `https://maps.googleapis.com/maps/api/geocode/json?key=${config.geocoding.geocodeKey}`;

export const reverseGeocodingApiUrl = `https://apis.mappls.com/advancedmaps/v1/${config.geocoding.reverseGeocodeKey}/rev_geocode`;

export const ALLOWED_STATES = ["WEST_BENGAL"];
