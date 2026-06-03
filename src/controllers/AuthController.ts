import { Request, Response } from "express";
import { authSchema } from "../schemas";
import { authService } from "../services/authService";

export class AuthController {
  async login(req: Request, res: Response) {
    const parsed = authSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues });
      return;
    }

    const token = await authService.login(parsed.data.email, parsed.data.password);
    if (!token) {
      res.status(401).json({ error: "Credenciais inválidas" });
      return;
    }

    res.json({ token });
  }
}

export const authController = new AuthController();
