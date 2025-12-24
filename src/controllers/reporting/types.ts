export interface Reporting {
  id: string;
  observedAt: string;
  latitude: number;
  longitude: number;
  district: string;
  block: string;
  villageOrGhat: string;
  species: Array<{
    type: string;
    adult: {
      stranded: number;
      injured: number;
      dead: number;
    };
    adultMale: {
      stranded: number;
      injured: number;
      dead: number;
    };
    adultFemale: {
      stranded: number;
      injured: number;
      dead: number;
    };
    subAdult: {
      stranded: number;
      injured: number;
      dead: number;
    };
  }>;
  images: string[];
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
  stranded?: number;
  injured?: number;
  dead?: number;
}

export interface SpeciesData {
  type: string;
  ageGroup: {
    adult?: AgeGroup;
    adultMale?: AgeGroup;
    adultFemale?: AgeGroup;
    subAdult?: AgeGroup;
  };
  cause?: string[];
  otherCause?: string | null;
}

export interface ReportingReqBody {
  observedAt: string;
  latitude: number;
  longitude: number;
  villageOrGhat: string;
  district: string;
  block: string;
  state: string;
  images?: string[];
  species?: SpeciesData[];
  notes?: string;
}
