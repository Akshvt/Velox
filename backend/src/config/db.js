import mongoose from "mongoose";
import { MONGODB_URI } from "./env.js";

const MAX_RETRIES = 5;

/**
 * Connects to MongoDB with exponential backoff retry.
 * Exits the process if all retries are exhausted.
 */
async function connectDB(attempt = 0) {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected");
  } catch (err) {
    if (attempt >= MAX_RETRIES) {
      console.error("MongoDB: max retries reached, exiting");
      process.exit(1);
    }
    const delay = Math.min(1000 * 2 ** attempt, 30000);
    console.warn(`MongoDB: retry ${attempt + 1} in ${delay / 1000}s —`, err.message);
    setTimeout(() => connectDB(attempt + 1), delay);
  }
}

export default connectDB;
