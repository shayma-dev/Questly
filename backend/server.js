import express from "express";
import session from "express-session";
import passport from "passport";
import env from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
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
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));


app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Questly API" });
});

app.listen(port, () => {
  console.log(`Questly server running at http://localhost:${port}`);
});