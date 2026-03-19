import 'server-only';
import { z } from 'zod';

function toTrimmedNonEmptyString(value: unknown) {
  if (typeof value !== 'string') return undefined;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

const requiredTrimmedString = z.preprocess(
  (v) => toTrimmedNonEmptyString(v),
  z.string()
);

const requiredPositiveInt = z.preprocess((v) => {
  if (typeof v === 'string') {
    const trimmed = v.trim();
    if (!trimmed) return undefined;

    const num = Number(trimmed);

    return Number.isNaN(num) ? v : num;
  }

  return v;
}, z.number().int().positive());

const EnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string()
    .min(1)
    .transform((v) => v.replace(/\/+$/, '')),
  MONGODB_URI: requiredTrimmedString,
 
  NEXT_JWT_ACCESS_SECRET: requiredTrimmedString,
  NEXT_JWT_REFRESH_SECRET: requiredTrimmedString,
  SMTP_HOST: requiredTrimmedString,
  SMTP_PORT: requiredPositiveInt,
  SMTP_USER: requiredTrimmedString,
  SMTP_PASS: requiredTrimmedString,

  NEXT_PUBLIC_SITE_URL: z
    .string()
    .min(1)
    .optional()
    .transform((v) => (v ? v : undefined)),
  NEXT_PUBLIC_PROXY_URL: z.string().min(1).optional(),
  NEXT_PUBLIC_M3U8_PROXY_URL: z.string().min(1).optional(),
  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),
});

const rawEnv = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  MONGODB_URI: process.env.MONGODB_URI,
  NEXT_JWT_ACCESS_SECRET:
    process.env.NEXT_JWT_ACCESS_SECRET ?? process.env.JWT_ACCESS_SECRET,
  NEXT_JWT_REFRESH_SECRET:
    process.env.NEXT_JWT_REFRESH_SECRET ?? process.env.JWT_REFRESH_SECRET,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_PROXY_URL: process.env.NEXT_PUBLIC_PROXY_URL,
  NEXT_PUBLIC_M3U8_PROXY_URL: process.env.NEXT_PUBLIC_M3U8_PROXY_URL,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};

export const env = EnvSchema.parse(rawEnv);
export type Env = typeof env;
