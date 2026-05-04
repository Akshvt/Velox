import mongoose from "mongoose";
import { MONGODB_URI, NODE_ENV } from "./env.js";

const MAX_RETRIES = 5;

/**
 * Connects to MongoDB with exponential backoff retry.
 * Configures connection pool for production scalability.
 */
async function connectDB(attempt = 0) {
  try {
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize:  NODE_ENV === "production" ? 50 : 10,
      minPoolSize:  2,
      // Disable auto-indexing in production - indexes should be created via migrations
      autoIndex:    NODE_ENV !== "production",
      // Buffer commands for up to 10s while reconnecting
      serverSelectionTimeoutMS: 10000,
    });
    console.log("MongoDB connected");
  } catch (err) {
    if (attempt >= MAX_RETRIES) {
      console.error("MongoDB: max retries reached, exiting");
      process.exit(1);
    }
    const delay = Math.min(1000 * 2 ** attempt, 30000);
    console.warn(`MongoDB: retry ${attempt + 1} in ${delay / 1000}s -`, err.message);
    setTimeout(() => connectDB(attempt + 1), delay);
  }
}

export default connectDB;
