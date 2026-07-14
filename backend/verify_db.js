import { MONGODB_URI } from "./src/config/env.js";
import mongoose from "mongoose";
import Tenant from "./src/models/Tenant.js";

async function run() {
  await mongoose.connect(MONGODB_URI);
  const tenants = await Tenant.find({}).sort({ createdAt: -1 });
  tenants.forEach(t => {
    console.log(`Tenant: ${t.name} | API Key: ${t.apiKey ? t.apiKey.substring(0,10) + '***' : 'MISSING'}`);
  });
  process.exit(0);
}

run();
