import {query} from "../models/db.js";
import fs from "fs";
import cloudinary from '../config/cloudinary.js';


export const getProfile = async (req, res) => {
  try {
    const subjects = await query("SELECT * FROM subjects WHERE user_id = $1", [req.user.id]);
    res.json({ user: req.user, subjects: subjects.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error loading profile" });
  }
};

export const updateUsername = async (req, res) => {
  const { username } = req.body;

  if (username.length < 3 || username.length > 50) {
    return res.status(400).json({ error: "Username must be between 3 and 50 characters long" });
  }
   const existingUsername = await query("SELECT * FROM users WHERE LOWER(username) = LOWER($1)", [username]);
    if (existingUsername.rows.length > 0) {
      return res.status(400).json({ error: "Username already taken" });
    }

  try {
    await query("UPDATE users SET username = $1 WHERE id = $2", [username, req.user.id]);
    req.user.username = username;
    res.status(200).json({ success: true, message: "Username updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating username" });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    const filePath = req.file.path;

    const result = await cloudinary.uploader.upload(filePath, {
      folder: "avatars",
      public_id: `user_${req.user.id}`, 
      overwrite: true,
    });

    fs.unlinkSync(filePath);

    await query("UPDATE users SET avatar_url = $1 WHERE id = $2", [result.secure_url, req.user.id]);

    res.status(200).json({ message: "Avatar updated successfully", avatarUrl: result.secure_url });
  } catch (err) {
    console.error("Error uploading avatar:", err);
    res.status(500).json({ error: "Failed to upload avatar" });
  }
};

export const addSubject = async (req, res) => {
  const { name } = req.body;
  const existingSubject = await query("SELECT * FROM subjects WHERE user_id = $1 AND LOWER(name) = LOWER($2)", [req.user.id , name]);
    if (existingSubject.rows.length > 0) {
      return res.status(400).json({ error: "Subject already added" });
    }
  try {
    const result = await query("INSERT INTO subjects (name, user_id) VALUES ($1, $2) RETURNING id", [name, req.user.id]);
    res.status(201).json({ message: "Subject added", id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error adding subject" });
  }
};

 export const deleteSubject = async (req, res) => {
  const subjectId = req.params.id;

  try {
    const existingSubject = await query("SELECT * FROM subjects WHERE user_id = $1 AND id =$2", [req.user.id , subjectId]);
    if (existingSubject.rows.length === 0) {
      return res.status(400).json({ error: "Subject doesn't exist"});
    }
    await query("DELETE FROM subjects WHERE id = $1 AND user_id = $2", [subjectId, req.user.id]);
    res.status(200).json({ message: "Subject deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting subject" });
  }
};

export const logout = (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: "Logout error" });
    res.status(200).json({ message: "Logged out" });
  });
};
