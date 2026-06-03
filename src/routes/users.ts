import { Router } from "express";
import auth, { adminAuth } from "../middleware/auth";
import upload from "../middleware/upload";
import { userController } from "../controllers/UserController";

const router = Router();

router.get("/users", auth, (req, res) => userController.list(req, res));
router.get("/users/:id", auth, (req, res) => userController.getById(req, res));
router.post("/users", adminAuth, upload.single("photo"), (req, res) => userController.create(req, res));
router.put("/users/:id", adminAuth, upload.single("photo"), (req, res) => userController.update(req, res));
router.delete("/users/:id/photo", adminAuth, (req, res) => userController.clearPhoto(req, res));
router.delete("/users/:id", adminAuth, (req, res) => userController.delete(req, res));

export default router;
