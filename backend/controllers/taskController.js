import {query} from "../models/db.js";

// GET /api/tasks
export const getTasks = async (req, res) => {
  const userId = req.user.id;

  try {
    const tasksResult = await query(
      `SELECT tasks.*, subjects.name AS subject_name
       FROM tasks 
       JOIN subjects ON tasks.subject_id = subjects.id
       WHERE tasks.user_id = $1 
       ORDER BY due_date ASC`,
      [userId]
    );

    const subjectsResult = await query(
      `SELECT * FROM subjects WHERE user_id = $1 ORDER BY name ASC`,
      [userId]
    );

    res.json({
      tasks: tasksResult.rows,
      subjects: subjectsResult.rows,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error loading tasks" });
  }
};
// GET /api/tasks/:id
export const getTaskById = async (req, res) => {
  try {
    const result = await query(
      `SELECT tasks.*, subjects.name AS subject_name
       FROM tasks 
       JOIN subjects ON tasks.subject_id = subjects.id
       WHERE tasks.id = $1 AND tasks.user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching task" });
  }
};

// POST /api/tasks
export const createTask = async (req, res) => {
  const { title, description, subject_id, due_date } = req.body;

  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "Title is required and must be a non-empty string." });
  }


  if (!due_date || !/^\d{4}-\d{2}-\d{2}$/.test(due_date)) {
    return res.status(400).json({ error: "due_date must be in format YYYY-MM-DD." });
  }

    const subjectCheck = await query(
      "SELECT * FROM subjects WHERE id = $1 AND user_id = $2",
      [subject_id, req.user.id]
    );

    if (subjectCheck.rows.length === 0) {
      return res.status(404).json({ error: "Subject not found." });
    }

  try {
    const result = await query(
      `INSERT INTO tasks (user_id, title, description, subject_id, due_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, title, description, subject_id, due_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error adding task" });
  }
};

// PUT /api/tasks/:id
export const updateTask = async (req, res) => {
  const { title, description, due_date, subject_id } = req.body;

  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "Title is required and must be a non-empty string." });
  }

  if (!due_date || !/^\d{4}-\d{2}-\d{2}$/.test(due_date)) {
    return res.status(400).json({ error: "due_date must be in format YYYY-MM-DD." });
  }

   const subjectCheck = await query(
      "SELECT * FROM subjects WHERE id = $1 AND user_id = $2",
      [subject_id, req.user.id]
    );

    if (subjectCheck.rows.length === 0) {
      return res.status(404).json({ error: "Subject not found." });
    }
 

    const taskResult = await query(
      "SELECT * FROM tasks WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: "Task not found"});
    }

  try {
    const result =  await query(
      `UPDATE tasks 
       SET title = $1, description = $2, due_date = $3, subject_id = $4
       WHERE id = $5 AND user_id = $6 RETURNING *`,
      [title, description, due_date, subject_id, req.params.id, req.user.id]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update task" });
  }
};

// DELETE /api/tasks/:id
export const deleteTask = async (req, res) => {
   const taskResult = await query(
      "SELECT * FROM tasks WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: "Task not found"});
    }
  try {
    const result = await query(
      `DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *`,
      [req.params.id, req.user.id]
    );
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting task" });
  }
};

// PATCH /api/tasks/:id/toggle
export const toggleTask = async (req, res) => {
const taskResult = await query(
      "SELECT * FROM tasks WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: "Task not found"});
    }
  try {
    const result = await query(
      `UPDATE tasks 
       SET is_completed = NOT is_completed
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [req.params.id, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error toggling task completion" });
  }
};
