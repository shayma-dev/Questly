import { query } from "../models/db.js";

export const getNotes = async (req, res) => {
  try {
    const [subjects, notes] = await Promise.all([
      query("SELECT * FROM subjects WHERE user_id = $1", [req.user.id]),
      query(
        `
        SELECT notes.*, subjects.name AS subject_name 
        FROM notes 
        LEFT JOIN subjects ON notes.subject_id = subjects.id
        WHERE notes.user_id = $1
        ORDER BY notes.created_at DESC
      `,
        [req.user.id]
      ),
    ]);

    res.json({ subjects: subjects.rows, notes: notes.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

export const createNote = async (req, res) => {
  const { title, content, subject_id } = req.body;
  if (!title || !content || !subject_id) {
    return res
      .status(400)
      .json({ error: "title, content and subject_id are required" });
  }
  if (title.length < 3 || title.length > 120) {
    return res
      .status(400)
      .json({ error: "title must be between 3 and 120 characters" });
  }
  if (content.length > 12000) {
    return res
      .status(400)
      .json({ error: "content is too long (max 12000 characters)" });
  }
  const subjectCheck = await query(
    "SELECT id FROM subjects WHERE id = $1 AND user_id = $2",
    [subject_id, req.user.id]
  );
  if (subjectCheck.rows.length === 0) {
    return res.status(400).json({ error: "subject not found" });
  }
  try {
    const result = await query(
      "INSERT INTO notes (title, content, subject_id, user_id) VALUES ($1, $2, $3, $4)RETURNING *",
      [title, content, subject_id, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating note" });
  }
};

export const updateNote = async (req, res) => {
  const { title, content, subject_id } = req.body;
  if (!title || !content || !subject_id) {
    return res
      .status(400)
      .json({ error: "title, content and subject_id are required" });
  }
  if (title.length < 3 || title.length > 120) {
    return res
      .status(400)
      .json({ error: "title must be between 3 and 120 characters" });
  }
  if (content.length > 12000) {
    return res
      .status(400)
      .json({ error: "content is too long (max 12000 characters)" });
  }
  const subjectCheck = await query(
    "SELECT id FROM subjects WHERE id = $1 AND user_id = $2",
    [subject_id, req.user.id]
  );
  if (subjectCheck.rows.length === 0) {
    return res.status(400).json({ error: "subject not found" });
  }

  const noteCheck = await query(
    "SELECT id FROM notes WHERE id = $1 AND user_id = $2",
    [req.params.id, req.user.id]
  );
  if (noteCheck.rows.length === 0) {
    return res.status(404).json({ error: "Note not found" });
  }

  try {
    const result = await query(
      `UPDATE notes SET title = $1, content = $2, subject_id = $3 
       WHERE id = $4 AND user_id = $5 RETURNING *`,
      [title, content, subject_id, req.params.id, req.user.id]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating note" });
  }
};

export const deleteNote = async (req, res) => {
  const noteCheck = await query(
    "SELECT id FROM notes WHERE id = $1 AND user_id = $2",
    [req.params.id, req.user.id]
  );
  if (noteCheck.rows.length === 0) {
    return res.status(404).json({ error: "Note not found" });
  }
  try {
    await query("DELETE FROM notes WHERE id = $1 AND user_id = $2", [
      req.params.id,
      req.user.id,
    ]);
    res.status(200).json({ message: "Note deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting note" });
  }
};
