// backend/controllers/authController.js
import { query } from "../models/db.js";
import bcrypt from "bcrypt";
import validator from "validator";
const saltRounds = 10;

export const signup = async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ error: "Missing required fields: email, username, password" });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    return res.status(400).json({ error: "Password must be at least 8 chars and include upper/lowercase and a number." });
  }
  if (username.length < 3 || username.length > 50) {
    return res.status(400).json({ error: "Username must be between 3 and 50 chars" });
  }

  try {
    const existingEmail = await query("SELECT 1 FROM users WHERE email = $1", [email]);
    if (existingEmail.rows.length) return res.status(400).json({ error: "Email already registered" });

    const existingUsername = await query("SELECT 1 FROM users WHERE username = $1", [username]);
    if (existingUsername.rows.length) return res.status(400).json({ error: "Username already taken" });

    const hash = await bcrypt.hash(password, saltRounds);
    const { rows } = await query(
      "INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING id, email, username, avatar_url",
      [email, hash, username]
    );

    const user = rows[0]; 
    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: "Login failed after signup" });
      return res.status(201).json({ message: "User registered", user });
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Signup error", details: err.message });
  }
};

export const logout = (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: "Logout error" });
    req.session.destroy(() => {
      res.clearCookie("sid", { path: "/" });
      res.status(204).end();
    });
  });
};