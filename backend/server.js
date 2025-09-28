// backend/server.js
import env from "dotenv";
import express from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import configurePassport from "./config/passport.js";
import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js";
import plannerRoutes from "./routes/planner.js";
import sessionRoutes from "./routes/sessions.js";
import noteRoutes from "./routes/notes.js";
import profileRoutes from "./routes/profile.js";

import { connectDB } from "./models/db.js";

// Only load .env in non-production
if (process.env.NODE_ENV !== "production") {
  env.config();
}

const app = express();
const port = process.env.PORT || 5000;

// Connect to DB before starting the server
await connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ---------------- CORS: single source of truth ---------------- */
const defaultAllowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://questly-sandy.vercel.app",
];

const envOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const allowedOrigins = envOrigins.length ? envOrigins : defaultAllowedOrigins;

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    const ok = allowedOrigins.includes(origin);
    return ok ? callback(null, true) : callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/**
 * Important: trust proxy must be set before session for secure cookies
 */
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 4,
      path: "/",
    },
  })
);

/* MINIMAL FIX: configure passport BEFORE using passport middlewares */
configurePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, "public")));

// Make user accessible
app.use((req, _res, next) => {
  req.appUser = req.user || null;
  next();
});

/* ---------------- Routes ---------------- */
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/planner", plannerRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/profile", profileRoutes);

app.get("/", (_req, res) => {
  res.json({ message: "Welcome to Questly API" });
});

/* ---------------- Start Server ---------------- */
app.listen(port, () => {
  console.log(`Questly server running on port ${port}`);
});

process.on("unhandledRejection", (e) => {
  console.error("UNHANDLED REJECTION:", e && (e.stack || e));
});