import { z } from "zod";

/**
 * Single source of truth for every environment variable.
 * Rule: no other file reads `process.env` directly.
 */
if (typeof window !== "undefined") {
  throw new Error(
    "lib/config/env.js was imported from client-side code. " +
      "Server configuration must never reach the browser.",
  );
}

/**
 * Deliberately NOT z.url(). A MongoDB seed list like
 * `mongodb://a:b@h1:27017,h2:27017/` is a legal connection string but an
 * illegal WHATWG URL — the parser reads `27017,h2` as the port and bails.
 * We only assert the scheme here; the driver does the real parsing and
 * reports a far better error than we could.
 */
const MONGO_URI_PATTERN = /^mongodb(\+srv)?:\/\/\S+$/;

const envSchema = z
  .object({
    // Three separate checks, so the error says *which* problem it is:
    // key absent, key present but blank, or key present but malformed.
    MONGO_URI: z
      .string({
        error: "MONGO_URI is missing — .env load hoy nai, ba key name vul",
      })
      .min(1, "MONGO_URI is present but empty")
      .regex(
        MONGO_URI_PATTERN,
        "MONGO_URI must start with mongodb:// or mongodb+srv:// and contain no spaces",
      ),

    MONGODB_DB_NAME: z.string().min(1).default("haatbari"),

    // "local" runs an ONNX model on this machine — no API key, no quota.
    EMBEDDING_PROVIDER: z.enum(["local", "gemini", "openai"]).default("local"),
    EMBEDDING_MODEL: z.string().min(1).optional(),

    GEMINI_API_KEY: z.string().min(1).optional(),
    OPENAI_API_KEY: z.string().min(1).optional(),

    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  })
  // An optional key stops being optional once you pick the provider that needs it.
  .refine(
    (cfg) => cfg.EMBEDDING_PROVIDER !== "gemini" || Boolean(cfg.GEMINI_API_KEY),
    {
      path: ["GEMINI_API_KEY"],
      error: "GEMINI_API_KEY is required when EMBEDDING_PROVIDER=gemini",
    },
  )
  .refine(
    (cfg) => cfg.EMBEDDING_PROVIDER !== "openai" || Boolean(cfg.OPENAI_API_KEY),
    {
      path: ["OPENAI_API_KEY"],
      error: "OPENAI_API_KEY is required when EMBEDDING_PROVIDER=openai",
    },
  );

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(
    `Invalid environment configuration:\n${z.prettifyError(parsed.error)}`,
  );
}

/** @type {Readonly<z.infer<typeof envSchema>>} */
const env = Object.freeze(parsed.data);

export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";

export default env;
