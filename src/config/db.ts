import fs from "fs";
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
  poolConfig.ssl = {
    ca: fs.readFileSync(config.db.caCertPath).toString(),
    rejectUnauthorized: true,
  };
}

export const pool = new Pool(poolConfig);
