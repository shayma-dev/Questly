import express from "express";
import session from "express-session";
import passport from "passport";
import env from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import configurePassport from "./config/passport.js";
import { connectDB } from "./models/db.js";

const app = express();
env.config();
const port = process.env.PORT || 5000;
// Call connectDB to establish connection
connectDB(); // Connect to the database


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
  origin:'http://localhost:5173',
  credentials: true,
    methods: ["GET","HEAD","PUT","PATCH","POST","DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("trust proxy", 1);


// Sessions: cross-origin cookie flags (MemoryStore)
app.use(session({
  name: "sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,        // important to not save empty sessions
  cookie: {
    httpOnly: true,
    secure: false,                  // required when SameSite=None; works on Chrome localhost
    sameSite: "lax",              // allow cross-origin
    maxAge: 1000 * 60 * 60 * 4,    // 4 hours
    path: "/",
  },
}));

app.use(passport.initialize());
app.use(passport.session());
configurePassport(passport);

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Routes
app.use("/api/auth", authRoutes);

// Session check for SPA bootstrapping
app.get("/api/auth/session", (req, res) => {
  if (req.user) {
    const { password, password_hash, ...safe } = req.user;
    return res.json({ user: safe });
  }
  return res.status(401).json({ error: "UNAUTHENTICATED" });
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Questly API" });
});

app.listen(port, () => {
  console.log(`Questly server running at http://localhost:${port}`);
});