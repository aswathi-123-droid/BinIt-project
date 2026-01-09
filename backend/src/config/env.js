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
  JWT_ACCESS_SECRET: z
    .string()
    .min(1, "JWT_ACCESS_SECRET is required"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(1, "JWT_REFRESH_SECRET is required"),
  ACCESS_TOKEN_EXPIRES: z
    .string()
    .regex(/^\d+[smhd]$/, "ACCESS_TOKEN_EXPIRES must be like 15m, 1h, 7d"),
  REFRESH_TOKEN_EXPIRES: z
    .string()
    .regex(/^\d+[smhd]$/, "REFRESH_TOKEN_EXPIRES must be like 7d, 30d"),
  COOKIE_SECRET: z
    .string()
    .min(1, "COOKIE_SECRET is required"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number(),
  SMTP_SECURE: z.enum(["true", "false"]).default("false"),
  SMTP_USER: z.string().email(),
  SMTP_PASS: z.string().min(1),
  SMTP_FROM: z.string().min(1),
  REDIS_HOST: z.string().min(1, "REDIS_HOST is required"),
  REDIS_PORT: z.string().min(1, "REDIS_PORT is required"),
});

export const env = envSchema.parse(process.env);
