import { Router } from "express";
import jwt from "jsonwebtoken";
import * as repo from "../repository";
import { authSchema } from "../schemas";

const router = Router();

router.post("/auth", (req, res) => {
  const parsed = authSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }
  const { email, password } = parsed.data;

  const user = repo.findByEmail(email);
  if (!user || user.password !== password) {
    res.status(401).json({ error: "Credenciais inválidas" });
    return;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, type: user.type },
    process.env.JWT_SECRET as string,
    { expiresIn: "8h" },
  );

  res.json({ token });
});

export default router;
