import 'server-only';
import mongoose from 'mongoose';

// One connection per server instance, reused across hot reloads and requests.
const globalForMongo = globalThis as unknown as { __mongoose?: Promise<typeof mongoose> | null };

export function isDbConfigured() {
  return Boolean(process.env.MONGO_URI);
}

/**
 * Connects to MongoDB (MONGO_URI). Returns null when no URI is configured, so the
 * public site can fall back to the built-in content in src/data.
 *
 * autoIndex is off: connecting never creates indexes or collections on its own.
 */
export async function connectDb() {
  const uri = process.env.MONGO_URI;
  if (!uri) return null;
  if (!globalForMongo.__mongoose) {
    globalForMongo.__mongoose = mongoose
      .connect(uri, { autoIndex: false, serverSelectionTimeoutMS: 6000, maxPoolSize: 10 })
      .catch((error) => {
        globalForMongo.__mongoose = null; // allow a retry on the next request
        throw error;
      });
  }
  return globalForMongo.__mongoose;
}

/** Runs a read against the database, returning null if it's not configured or unreachable. */
export async function tryDb<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    const conn = await connectDb();
    if (!conn) return null;
    return await fn();
  } catch (error) {
    console.warn('[db] falling back to built-in content:', (error as Error).message);
    return null;
  }
}

/** For admin routes: connects or throws a clear error. */
export async function requireDb() {
  const conn = await connectDb();
  if (!conn) throw new DbNotConfiguredError();
  return conn;
}

export class DbNotConfiguredError extends Error {
  constructor() {
    super('MONGO_URI is not set. The admin panel needs a MongoDB database.');
  }
}
