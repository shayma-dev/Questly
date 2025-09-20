import express from "express";
import * as noteController from "../controllers/noteController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.get("/", isAuthenticated, noteController.getNotes);
router.post("/", isAuthenticated, noteController.createNote);
router.put("/:id", isAuthenticated, noteController.updateNote);
router.delete("/:id", isAuthenticated, noteController.deleteNote);

export default router;