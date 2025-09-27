import pg from "pg";
import env from "dotenv";

// Only load .env in non-production to avoid overriding Render envs
if (process.env.NODE_ENV !== "production") {
  env.config();
}

const url = process.env.DATABASE_URL;

if (!url) {
  console.error("missing required env variable: DATABASE_URL");
  process.exit(1);
}

// Decide SSL based on URL host
const needsSSL = /neon\.tech/i.test(url) || !/localhost|127\.0\.0\.1/.test(url);

// Create a new pool instance for database connections
const pool = new pg.Pool({
  connectionString: url,
  // SSL only when needed (Neon and most managed PG require it)
  ssl: needsSSL ? { rejectUnauthorized: false } : false,
});

// Ensure schema is public for each connection (belt-and-suspenders)
pool.on("connect", async (client) => {
  try {
    await client.query(`SET search_path TO ${process.env.SEARCH_PATH || "public"}`);
  } catch (e) {
    console.error("Failed to set search_path", e);
  }
});

// Function to connect to the database
const connectDB = async () => {
  try {
    await pool.query("SELECT 1"); // simple ping
    console.log("Connected to the database");
  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
};

// Error handling for the database pool
pool.on("error", (err) => {
  console.error("Database error: ", err);
  process.exit(1);
});

// Simplified query function with error handling
export const query = async (text, params) => {
  try {
    return await pool.query(text, params);
  } catch (error) {
    console.error("Error executing query", { text, params, error });
    throw error;
  }
};

export { connectDB };