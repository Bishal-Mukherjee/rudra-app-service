import { config } from "@/config/config";

export const speciesAgeGroups = {
  duo: [
    {
      label: { en: "Adults", bn: "পূর্ণবয়স্ক" },
      value: "adult",
    },
    {
      label: { en: "Calves", bn: "শাবক" },
      value: "subAdult",
    },
    // {
    //   label: { en: "Unidentified", bn: "শনাক্ত করা যায়নি" },
    //   value: "unidentified",
    // },
  ],
  trio: [
    {
      label: { en: "Adult Male", bn: "পূর্ণবয়স্ক পুরুষ" },
      value: "adultMale",
    },
    {
      label: { en: "Adult Female", bn: "পূর্ণবয়স্ক স্ত্রী" },
      value: "adultFemale",
    },
    {
      label: { en: "Sub-Adults/Juveniles", bn: "কিশোর/অপ্রাপ্তবয়স্ক" },
      value: "subAdult",
    },
    {
      label: { en: "Unidentified", bn: "শনাক্ত করা যায়নি" },
      value: "unidentified",
    },
  ],
} as const;

export const confirmationOptions = [
  {
    label: {
      en: "Yes",
      bn: "হ্যাঁ",
    },
    value: "YES",
  },
  {
    label: {
      en: "No",
      bn: "না",
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
  WINDY_OR_STORMY = "WINDY_OR_STORMY",
  SUSPENDED = "SUSPENDED";

export const geocodingApiUrl = `https://maps.googleapis.com/maps/api/geocode/json?key=${config.geocoding.geocodeKey}`;

export const reverseGeocodingApiUrl = `https://apis.mappls.com/advancedmaps/v1/${config.geocoding.reverseGeocodeKey}/rev_geocode`;

export const ALLOWED_STATES = ["WEST_BENGAL"];
