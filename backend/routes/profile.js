import express from "express";
import * as profileController from "../controllers/profileController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.get("/", isAuthenticated, profileController.getProfile);
router.patch("/update", isAuthenticated, profileController.updateUsername);
router.patch("/avatar", isAuthenticated, upload.single("avatar"), profileController.updateAvatar);
router.post("/subjects/add", isAuthenticated, profileController.addSubject);
router.delete("/subjects/delete/:id", isAuthenticated, profileController.deleteSubject);
router.get("/logout",isAuthenticated,profileController.logout);

export default router;