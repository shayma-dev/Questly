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
        const { password, password_hash, ...safe } = user;
        return res.status(200).json({ message: "Login successful", user: safe });
      });
    });
  })(req, res, next);
});

router.post("/logout", authController.logout);

export default router;