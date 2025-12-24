export interface Sighting {
  id: string;
  observedAt: string;
  latitude: number;
  longitude: number;
  waterBody: string;
  waterBodyCondition: string;
  weatherCondition: string;
  villageOrGhat: string;
  district: string;
  block: string;
  threats: string[];
  fishingGears: string[];
  species: Array<{
    type: string;
    adult: number;
    subAdult: number;
    adultMale: number;
    adultFemale: number;
  }>;
  images: string[];
  notes: string;
  type: string;
  submittedAt: string;
  submittedBy: {
    name: string;
    phoneNumber: string;
  };
}

export interface MatchResult {
  value: string | null;
  label: string | null;
  percentage: number;
}

export interface AgeGroup {
  adult?: number;
  adultMale?: number;
  adultFemale?: number;
  subAdult?: number;
}

export interface SpeciesData {
  type: string;
  ageGroup: AgeGroup;
}

export interface SightingReqBody {
  observedAt: string;
  latitude: number;
  longitude: number;
  villageOrGhat?: string;
  district?: string;
  block?: string;
  state?: string;
  hasWindyOrStormyWeather: string;
  channelType: string;
  waterBodyCondition: string;
  weatherCondition: string;
  waterBody: string;
  threats: string[];
  fishingGears?: string[];
  images?: string[];
  notes?: string;
  species: SpeciesData[];
}
