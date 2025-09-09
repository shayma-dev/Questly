import express from "express";
import * as taskController from "../controllers/taskController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.get("/", isAuthenticated, taskController.getTasks);
router.get("/:id", isAuthenticated, taskController.getTaskById);
router.post("/", isAuthenticated, taskController.createTask);
router.put("/:id", isAuthenticated, taskController.updateTask);
router.delete("/:id", isAuthenticated, taskController.deleteTask);
router.patch("/:id/toggle", isAuthenticated, taskController.toggleTask);

export default router;