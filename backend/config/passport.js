// backend/config/passport.js
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { query } from "../models/db.js";

const superAdmins = new Set(
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)
);

export default function configurePassport(passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const { rows } = await query(
            `SELECT id, email, username, avatar_url, role, COALESCE(is_suspended,false) AS is_suspended, password
               FROM users
              WHERE email = $1
              LIMIT 1`,
            [email]
          );
          if (!rows.length) return done(null, false);

          const row = rows[0];
          const ok = await bcrypt.compare(password, row.password);
          if (!ok) return done(null, false);

          if (row.is_suspended) {
            return done(null, false);
          }

          const isSuper = superAdmins.has(String(row.email).toLowerCase());
          if (isSuper && row.role !== "admin") {
            await query(`UPDATE users SET role='admin' WHERE id=$1`, [row.id]);
            row.role = "admin";
          }

          const { password: _omit, ...safe } = row;
          return done(null, safe);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser(async (id, done) => {
    try {
      const { rows } = await query(
        `SELECT id, email, username, avatar_url, role, COALESCE(is_suspended,false) AS is_suspended
           FROM users
          WHERE id = $1
          LIMIT 1`,
        [id]
      );
      if (!rows.length) return done(null, false);
      return done(null, rows[0]);
    } catch (err) {
      return done(err);
    }
  });
}