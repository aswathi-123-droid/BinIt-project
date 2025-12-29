import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),

  CLIENT_ORIGIN: z
    .string()
    .url("CLIENT_ORIGIN must be a valid URL"),

  MONGO_URI: z
    .string()
    .min(1, "MONGO_URI is required"),

  // JWT_SECRET: z
  //   .string()
  //   .min(1, "JWT_SECRET is required"),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export const env = envSchema.parse(process.env);
