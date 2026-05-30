import { connectDB, pool } from "../config/db";
import { utility } from "../utils/utility";
import dotenv from 'dotenv';

dotenv.config();

const runSeed = async (): Promise<void> => {
  try {
    await connectDB();
    utility.log("🌱 Schema ready. Add seeders here as needed.");
    utility.log("✅ Seed run complete");
    await pool.end();
    process.exit(0);
  } catch (error) {
    utility.error("❌ Seed failed:", error);
    try { await pool.end(); } catch (_) {}
    process.exit(1);
  }
};

runSeed();
