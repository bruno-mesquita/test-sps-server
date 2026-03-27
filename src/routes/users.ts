import { Router } from "express";
import auth from "../middleware/auth";
import * as repo from "../repository";
import { createUserSchema, updateUserSchema } from "../schemas";

const router = Router();

router.get("/users", auth, (req, res) => {
  res.json(repo.findAll());
});

router.post("/users", auth, (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }
  const { name, email, type, password } = parsed.data;

  if (repo.findByEmail(email)) {
    res.status(409).json({ error: "Email já cadastrado" });
    return;
  }

  const user = repo.create({ name, email, type, password });
  res.status(201).json(user);
});

router.put("/users/:id", auth, (req, res) => {
  const id = parseInt(req.params.id as string);
  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }
  const { name, email, type, password } = parsed.data;

  if (email) {
    const existing = repo.findByEmail(email);
    if (existing && existing.id !== id) {
      res.status(409).json({ error: "Email já cadastrado" });
      return;
    }
  }

  const user = repo.update(id, { name, email, type, password });
  if (!user) {
    res.status(404).json({ error: "Usuário não encontrado" });
    return;
  }

  res.json(user);
});

router.delete("/users/:id", auth, (req, res) => {
  const id = parseInt(req.params.id as string);
  const removed = repo.remove(id);
  if (!removed) {
    res.status(404).json({ error: "Usuário não encontrado" });
    return;
  }
  res.status(204).send();
});

export default router;
