import mongoose from "mongoose";
import env from "../config/env.js";

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
      })
      .then((instance) => instance.connection);
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null;
    console.error("❌ MongoDB CONNECTION ERROR:", error);
    throw error;
  }

  return cache.conn;
}
