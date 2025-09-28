// backend/routes/auth.js
import express from "express";
import passport from "passport";
import * as authController from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", authController.signup);

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    req.session.regenerate((err2) => {
      if (err2) return next(err2);
      req.login(user, (err3) => {
        if (err3) return next(err3);
        return res.status(200).json({ message: "Login successful", user });
      });
    });
  })(req, res, next);
});

router.post("/logout", authController.logout);

router.get("/session", (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ user: null, error: "unauthorized" });
    }
    return res.json({ user: req.user });
  } catch (e) {
    console.error("session error:", e?.message || e);
    return res.status(500).json({ user: null, error: "server_error" });
  }
});

export default router;