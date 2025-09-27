import {query} from "../models/db.js";

export const getPlanner = async (req, res) => {
  try {
    const subjects = (await query(
      "SELECT * FROM subjects WHERE user_id = $1 ORDER BY name ASC",
      [req.user.id]
    )).rows;

    const result = await query(
      `SELECT s.id, s.day, s.start_time, s.end_time, s.subject_id, sub.name AS subject
       FROM sessions_planner s
       JOIN subjects sub ON s.subject_id = sub.id
       WHERE sub.user_id = $1
       ORDER BY s.day, s.start_time`,
      [req.user.id]
    );

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const sessionsByDay = {};
    for (const day of daysOfWeek) {
      sessionsByDay[day] = [];
    }

    for (const session of result.rows) {
      sessionsByDay[session.day].push(session);
    }

    res.json({ sessionsByDay, subjects });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

export const createSession = async (req, res) => {
  const { day, subject_id, start_time, end_time } = req.body;
  try {
        if (end_time <= start_time) {
      return res.status(400).json({ error: "End time must be after start time" });
    }

    const subjectCheck = await query(
      "SELECT id FROM subjects WHERE id = $1 AND user_id = $2",
      [subject_id, req.user.id]
    );
    if (subjectCheck.rows.length === 0) {
      return res.status(400).json({ error: "subject not found" });
    }

    const overlapCheck = await query(
      `SELECT * FROM sessions_planner 
       WHERE day = $1 AND user_id = $2 AND
       (start_time, end_time) OVERLAPS ($3::time, $4::time)`,
      [day, req.user.id, start_time, end_time]
    );
    if (overlapCheck.rows.length > 0) {
      return res.status(400).json({ error: "Time conflict with existing session" });
    }

    const result = await query(
      `INSERT INTO sessions_planner (day, subject_id, start_time, end_time, user_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [day, subject_id, start_time, end_time, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

export const updateSession = async (req, res) => {
  const {day, subject_id, start_time, end_time } = req.body;
  try {
     if (end_time <= start_time) {
      return res.status(400).json({ error: "End time must be after start time" });
    }

    const current = await query(
      "SELECT * FROM sessions_planner WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );
    if (current.rows.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    const subjectCheck = await query(
      "SELECT * FROM subjects WHERE id = $1 AND user_id = $2",
      [subject_id, req.user.id]
    );
    if (subjectCheck.rows.length === 0) {
      return res.status(400).json({ error: "subject not found" });
    }

    const overlap = await query(
      `SELECT * FROM sessions_planner 
       WHERE day = $1 AND id != $2 AND user_id = $3 AND 
       (start_time, end_time) OVERLAPS ($4::time, $5::time)`,
      [day, req.params.id, req.user.id, start_time, end_time]
    );
    if (overlap.rows.length > 0){
      return res.status(400).json({ error: "Time conflict with existing session" });
    }
    const updated = await query(
      `UPDATE sessions_planner SET day =$1 ,subject_id = $2, start_time = $3, end_time = $4 
       WHERE id = $5 AND user_id = $6 RETURNING *`,
      [day , subject_id, start_time, end_time, req.params.id, req.user.id]
    );
    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

export const deleteSession = async (req, res) => {
  try {
    const result = await query(
      "DELETE FROM sessions_planner WHERE id = $1 AND user_id = $2 RETURNING *",
      [req.params.id, req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Session not found" });
    res.json({  message: "session deleted successfully"  });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};
