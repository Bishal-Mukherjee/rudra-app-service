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
  s3: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    lookupFolder: string;
  };
  geocoding: {
    geocodeKey: string;
    reverseGeocodeKey: string;
  };
  reportApiUrl: string;
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

const s3Config = () => {
  if (
    !process.env.AWS_S3_REGION ||
    !process.env.AWS_S3_ACCESS_KEY_ID ||
    !process.env.AWS_S3_SECRET_ACCESS_KEY ||
    !process.env.AWS_S3_BUCKET
  ) {
    throw new Error("Missing S3 configuration");
  }

  return {
    region: process.env.AWS_S3_REGION,
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    bucket: process.env.AWS_S3_BUCKET,
    lookupFolder: process.env.AWS_S3_LOOKUP_FOLDER || "platform-static-lookup",
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

const reportApiUrl = () => {
  if (!process.env.REPORT_API_URL) {
    throw new Error("Missing report api url configuration");
  }

  return process.env.REPORT_API_URL;
};

export const config: Config = {
  port: Number(process.env.SERVER_PORT) || 8080,
  jwtSecret: process.env.JWT_SECRET || "secret",
  db: dbConfig(),
  redis: redisConfig(),
  twilio: twilioConfig(),
  s3: s3Config(),
  geocoding: geocodingConfig(),
  reportApiUrl: reportApiUrl(),
};
