import pg from "pg";
import env from "dotenv";

env.config();

const requiredEnvVars = [
  "PG_USER",
  "PG_HOST",
  "PG_DATABASE",
  "PG_PASSWORD",
  "PG_PORT",
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.log(`missing required env variable : ${varName}`);
    process.exit(1);
  }
});

// Create a new pool instance for database connections
const pool = new pg.Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

// Function to connect to the database
const connectDB = async () => {
  try {
    await pool.connect();  // Attempt to connect to the database
    console.log("Connected to the database");
  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);  // Exit if connection fails
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
    return await pool.query(text, params);  // Execute the query
  } catch (error) {
    console.error("Error executing query", { text, params, error });
    throw error;  // Rethrow the error for higher-level handling
  }
};

// Export the connection function and query function
export { connectDB };