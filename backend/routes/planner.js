import express from "express";
import * as plannerController from "../controllers/plannerController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.get("/", isAuthenticated, plannerController.getPlanner);
router.post("/", isAuthenticated, plannerController.createSession);
router.put("/:id", isAuthenticated, plannerController.updateSession);
router.delete("/:id", isAuthenticated, plannerController.deleteSession);

export default router;