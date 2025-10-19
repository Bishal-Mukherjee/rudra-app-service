import fs from "fs";

// Check for command line arguments --development or --production
const envArg = process.argv.find(
  (arg) => arg === "--development" || arg === "--production",
);
if (envArg) {
  process.env.ENV_FILE =
    envArg === "--development" ? ".env.development" : ".env.production";
} else {
  if (fs.existsSync(".env.development")) {
    process.env.ENV_FILE = ".env.development";
  } else {
    throw new Error(".env.development file does not exist.");
  }
}
