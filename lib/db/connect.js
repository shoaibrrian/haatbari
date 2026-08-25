import mongoose from "mongoose";
// Relative, not "@/lib/config/env" — the jsconfig alias only resolves through
// Next's bundler, and CLI scripts (seed, embed) import this file via plain node.
import env from "../config/env.js";

/**
 * Serverless (Vercel) reuses a warm Node process across invocations but can
 * also run many in parallel. Without caching, every request opens a fresh
 * connection and Atlas hits its connection cap. So we cache on globalThis,
 * which survives Next's dev-mode hot reload too.
 *
 * We cache the *promise*, not just the connection — otherwise two concurrent
 * requests arriving before the first connect resolves would each start their
 * own handshake.
 */
const cache = (globalThis.__haatbariMongoose ??= {
  conn: null,
  promise: null,
});

export default async function connectDB() {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(env.MONGO_URI, {
        dbName: env.MONGODB_DB_NAME,

        // Default `true` makes mongoose silently queue queries when there is
        // no connection, then fail 10s later with a confusing timeout.
        // `false` fails immediately with the real error.
        bufferCommands: false,
        autoIndex: false,

        maxPoolSize: 10,
        minPoolSize: 0,
        serverSelectionTimeoutMS: 5_000,
        socketTimeoutMS: 45_000,
      })
      .then((instance) => instance.connection);
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    // Critical. Drop the rejected promise, otherwise every future request
    // awaits this same failure forever — even after Atlas recovers.
    cache.promise = null;
    throw error;
  }

  return cache.conn;
}
