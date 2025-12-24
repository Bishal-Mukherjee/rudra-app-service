import dotenv from "dotenv";
dotenv.config({ quiet: true });

if (process.env.NODE_ENV === "development") {
  dotenv.config({ path: ".env.development", override: true, quiet: true });
} else if (process.env.NODE_ENV === "staging") {
  dotenv.config({ path: ".env.staging", override: true });
}

interface Config {
  port: number;
  db: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  redis: {
    username: string;
    password: string;
    host: string;
    port: number;
  };
  twilio: {
    accountSid: string;
    authToken: string;
    serviceSid: string;
    appHash?: string;
  };
  jwtSecret: string;
  supabase: {
    url: string;
    lookupBucket: string;
    secretKey: string;
  };
  geocoding: {
    geocodeKey: string;
    reverseGeocodeKey: string;
  };
}

const dbConfig = () => {
  if (
    !process.env.DB_HOST ||
    !process.env.DB_PORT ||
    !process.env.DB_NAME ||
    !process.env.DB_USER ||
    !process.env.DB_PASSWORD
  ) {
    throw new Error("Missing database configuration");
  }

  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  };
};

const redisConfig = () => {
  if (
    !process.env.REDIS_USERNAME ||
    !process.env.REDIS_PASSWORD ||
    !process.env.REDIS_HOST ||
    !process.env.REDIS_PORT
  ) {
    throw new Error("Missing redis configuration");
  }

  return {
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  };
};

const twilioConfig = () => {
  if (
    !process.env.TWILIO_ACCOUNT_SID ||
    !process.env.TWILIO_AUTH_TOKEN ||
    !process.env.TWILIO_SERVICE_SID
  ) {
    throw new Error("Missing twilio configuration");
  }

  return {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    serviceSid: process.env.TWILIO_SERVICE_SID,
    appHash: process.env.TWILIO_APP_HASH,
  };
};

const supabaseConfig = () => {
  if (
    !process.env.SUPABASE_URL ||
    !process.env.SUPABASE_LOOKUP_BUCKET ||
    !process.env.SUPABASE_SECRET_KEY
  ) {
    throw new Error("Missing supabase configuration");
  }

  return {
    url: process.env.SUPABASE_URL,
    lookupBucket: process.env.SUPABASE_LOOKUP_BUCKET,
    secretKey: process.env.SUPABASE_SECRET_KEY,
  };
};

const geocodingConfig = () => {
  if (!process.env.GEOCODE_API_KEY || !process.env.REVERSE_GEOCODE_API_KEY) {
    throw new Error("Missing geocoding configuration");
  }

  return {
    geocodeKey: process.env.GEOCODE_API_KEY,
    reverseGeocodeKey: process.env.REVERSE_GEOCODE_API_KEY,
  };
};

export const config: Config = {
  port: Number(process.env.SERVER_PORT) || 8080,
  jwtSecret: process.env.JWT_SECRET || "secret",
  db: dbConfig(),
  redis: redisConfig(),
  twilio: twilioConfig(),
  supabase: supabaseConfig(),
  geocoding: geocodingConfig(),
};
