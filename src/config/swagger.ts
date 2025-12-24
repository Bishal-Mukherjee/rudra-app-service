import swaggerJsdoc from "swagger-jsdoc";
import path from "path";
import { config } from "@/config/config";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "RUDRA App Service",
    version: "1.0.0",
    description:
      "API documentation for RUDRA App Service - A platform for tracking and reporting marine life sightings",
  },
  servers: [
    {
      url: `http://localhost:${config.port}/api/v1`,
      description: "Local server",
    },
    {
      url: "https://dev.app.rudratracker.org/api/v1",
      description: "Development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token in the format: Bearer <token>",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: {
            type: "string",
            description: "Error message",
          },
          message: {
            type: "string",
            description: "Detailed error description",
          },
        },
      },
      Success: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            description: "Operation success status",
          },
          message: {
            type: "string",
            description: "Success message",
          },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: "Access token is missing or invalid",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
            example: {
              error: "Unauthorized",
              message: "Invalid or expired token",
            },
          },
        },
      },
      NotFoundError: {
        description: "The specified resource was not found",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
            example: {
              error: "Not Found",
              message: "Resource not found",
            },
          },
        },
      },
      BadRequestError: {
        description: "Invalid request parameters",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
            example: {
              error: "Bad Request",
              message: "Invalid input data",
            },
          },
        },
      },
      InternalServerError: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
            example: {
              error: "Internal Server Error",
              message: "An unexpected error occurred",
            },
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    {
      name: "Auth",
      description: "Authentication endpoints",
    },
    {
      name: "Module",
      description: "Module management endpoints",
    },
    {
      name: "Notification",
      description: "Notification endpoints",
    },
    {
      name: "Question",
      description: "Question management endpoints",
    },
    {
      name: "Region",
      description: "Region management endpoints",
    },
    {
      name: "Reporting",
      description: "Reporting endpoints",
    },
    {
      name: "Resource",
      description: "Resource management endpoints",
    },
    {
      name: "Sighting",
      description: "Sighting reporting and management endpoints",
    },
    {
      name: "Species",
      description: "Species information endpoints",
    },
    {
      name: "Submission",
      description: "Submission management endpoints",
    },
    {
      name: "Tier",
      description: "Tier management endpoints",
    },
    {
      name: "User",
      description: "User management endpoints",
    },
  ],
};

const options: swaggerJsdoc.Options = {
  swaggerDefinition,
  // Path to the API routes files
  apis: [
    path.join(__dirname, "../routes/**/*.ts"),
    path.join(__dirname, "../controllers/**/*.ts"),
    path.join(__dirname, "../routes/**/*.js"),
    path.join(__dirname, "../controllers/**/*.js"),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
