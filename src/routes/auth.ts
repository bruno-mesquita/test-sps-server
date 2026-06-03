import { Router } from "express";
import { authController } from "../controllers/AuthController";

const router = Router();

router.post("/auth", (req, res) => authController.login(req, res));

export default router;
