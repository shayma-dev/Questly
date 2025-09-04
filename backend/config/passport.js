import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import {query} from "../models/db.js";
import env from "dotenv";
env.config();

export default function configurePassport(passport) {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
      try {
        const result = await query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length > 0) {
          const user = result.rows[0];
          bcrypt.compare(password, user.password, (err, valid) => {
            return err ? done(err) : valid ? done(null, user) : done(null, false);
          });
        } else {
          return done(null, false);
        }
      } catch (err) {
        done(err);
      }
    })
  );

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const result = await query("SELECT * FROM users WHERE id = $1", [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err);
  }
});
}
