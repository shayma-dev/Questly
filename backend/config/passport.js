// backend/config/passport.js
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { query } from "../models/db.js";
import env from "dotenv";
env.config();

export default function configurePassport(passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const result = await query("SELECT * FROM users WHERE email = $1 LIMIT 1", [email]);
          if (!result.rows.length) return done(null, false);

          const user = result.rows[0];

          const valid = await bcrypt.compare(password, String(user.password));
          if (!valid) return done(null, false);

          const { password: _omit, ...safeUser } = user;
          return done(null, safeUser);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser(async (id, done) => {
    try {
      const result = await query("SELECT * FROM users WHERE id = $1 LIMIT 1", [id]);
      if (!result.rows.length) return done(null, false);

      const { password: _omit, ...safeUser } = result.rows[0];
      return done(null, safeUser);
    } catch (err) {
      return done(err);
    }
  });
}