require("dotenv").config();
const mongoose = require("mongoose");

const MAX_RETRIES = 5;
const INITIAL_DELAY = 1000;
const MAX_DELAY = 30000;

async function ConnectDB(retryCount = 0) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Database Connected");
  } catch (error) {
    console.log(`Connection attempt ${retryCount + 1} failed: `, error.message);

    if (retryCount < MAX_RETRIES) {
      const delay = Math.min(
        INITIAL_DELAY * Math.pow(2, retryCount),
        MAX_DELAY,
      );

      console.log(`Retrying in ${delay / 1000} seconds...`);

      setTimeout(() => {
        ConnectDB(retryCount + 1);
      }, delay);
    } else {
      console.error("Max retries reached. Could not connect to MongoDB");
      process.exit(1);
    }
  }
}

module.exports = { ConnectDB };
