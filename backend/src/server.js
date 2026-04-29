import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";

import connectDB from "./config/db.js";
import "./config/redis.js"; // initialise Redis connection on startup
import authRoutes from "./routes/auth.routes.js";
import errorHandler from "./middleware/errorHandler.js";
import { PORT, CLIENT_URL } from "./config/env.js";

const app = express();

// Security headers, CORS, body parsing, cookie parsing
app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.get("/health",   (_, res) => res.json({ status: "ok" }));

// Must be registered last — catches any error thrown in route handlers
app.use(errorHandler);

await connectDB();
app.listen(PORT, () => console.log(`Server on port ${PORT}`));
