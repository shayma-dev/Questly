import { query } from "../models/db.js";
import bcrypt from "bcrypt";
import validator from "validator"; // Validator library for email validation

const saltRounds = 10;

export const signup = async (req, res) => {
    const { email, password, username } = req.body;

    // Input Validation: Missing Fields
    if (!email || !password || !username) {
        return res.status(400).json({ error: "Missing required fields: email, username, password" });
    }

    // Email Format Validation
    if (!validator.isEmail(email)) {
        return res.status(400).json({ error: "Invalid email format" });
    }

    try {
        // Check for existing email
        const existingEmail = await query("SELECT * FROM users WHERE email = $1", [email]);
        if (existingEmail.rows.length > 0) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // Check for existing username
        const existingUsername = await query("SELECT * FROM users WHERE username = $1", [username]);
        if (existingUsername.rows.length > 0) {
            return res.status(400).json({ error: "Username already taken" });
        }

        // Password Validation
        if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
            return res.status(400).json({ error: "Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, and a number." });
        }

        if (username.length < 3 || username.length > 50) {
            return res.status(400).json({ error: "Username must be between 3 and 50 characters long" });
        }

        // Hash password and register user
        const hash = await bcrypt.hash(password, saltRounds);
        const result = await query(
            "INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING *",
            [email, hash, username]
        );

        // Log the user in immediately after signup
        req.login(result.rows[0], (err) => {
            if (err) return res.status(500).json({ error: "Login failed after signup" });
            return res.status(201).json({ message: "User registered", user: result.rows[0] });
        });
    } catch (err) {
        console.error("Error while signing up user", err);
        return res.status(500).json({ error: "Signup error", details: err.message });
    }
};

export const loginSuccess = (req, res) => {
  res.status(200).json({ message: "Login successful", user: req.user });
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



