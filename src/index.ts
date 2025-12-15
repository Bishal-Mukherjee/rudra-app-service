// path alias configuration
import "./alias";

import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { pool } from "@/config/db";
import { redisClient } from "@/config/redis";
import { config } from "@/config/config";
import { swaggerSpec } from "@/config/swagger";
import { rateLimiter } from "@/utils/rate-limit";
import { router as apiRoutes } from "@/routes";
import { errorHandler } from "@/middlewares/error-handler";

const app = express();

// Middlewares
app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),
);
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(rateLimiter);

// DB Connection
pool.connect((err) => {
  if (err) {
    console.error("Error connecting to Database", err.message);
    process.exit(1);
  } else {
    console.info("🔹 Connected to database");
  }
});

// Redis Connection
redisClient
  .connect()
  .then(() => console.log("🔹 Connected to redis"))
  .catch((err: Error) => {
    console.log("Error connecting to Redis");
    console.log(err);
  });

// Routes
app.get("/", (req, res) => {
  res.send(" 🚀 SERVER WORKING ");
});

// Swagger Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "RUDRA App Service API Documentation",
    customfavIcon: "/favicon.ico",
  }),
);

app.use("/api/v1", apiRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `${req.method} ${req.originalUrl} not found`,
  });
});

// Error Handler
app.use(errorHandler);

const port = config.port;

app.listen(port, () => {
  console.info(
    `🚀 Server started
🔸 Environment : ${process.env.NODE_ENV}
🔹 Listening on : http://localhost:${port}`,
  );
});
