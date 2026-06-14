import fs from "fs";
import path from "path";
import { Pool, PoolConfig } from "pg";
import { config } from "@/config/config";

const poolConfig: PoolConfig = {
  user: config.db.user,
  database: config.db.name,
  host: config.db.host,
  port: config.db.port,
  password: config.db.password,
  max: config.db.poolMax,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

if (config.db.ssl) {
  const caCertPath = path.join(process.cwd(), "global-bundle.pem");

  poolConfig.ssl = {
    ca: fs.readFileSync(caCertPath).toString(),
    rejectUnauthorized: true,
  };
}

export const pool = new Pool(poolConfig);
