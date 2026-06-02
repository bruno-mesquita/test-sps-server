import { Router } from "express";
import auth, { adminAuth } from "../middleware/auth";
import upload from "../middleware/upload";
import * as repo from "../repository";
import { findPhotoById } from "../photoRepository";
import { createUserSchema, updateUserSchema } from "../schemas";
import { processPhoto } from "../services/photoService";
import type { User } from "../types";

function withPhoto(user: User) {
  const photo = user.photoId ? findPhotoById(user.photoId) : undefined;
  return {
    ...user,
    originalUrl: photo?.originalUrl ?? null,
    previewUrl: photo?.previewUrl ?? null,
  };
}

const router = Router();

router.get("/users", auth, (req, res) => {
  res.json(repo.findAll().map(withPhoto));
});

router.get("/users/:id", auth, (req, res) => {
  const id = parseInt(req.params.id as string);
  const user = repo.findById(id);
  if (!user) {
    res.status(404).json({ error: "Usuário não encontrado" });
    return;
  }
  res.json(withPhoto(user));
});

router.post("/users", adminAuth, upload.single("photo"), async (req, res) => {
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

  let photoId: number | undefined;
  if (req.file) {
    const photo = await processPhoto(req.file);
    photoId = photo.id;
  }

  const user = repo.create({ name, email, type, password, photoId });
  res.status(201).json(user);
});

router.put("/users/:id", adminAuth, (req, res) => {
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

router.delete("/users/:id", adminAuth, (req, res) => {
  const id = parseInt(req.params.id as string);
  const removed = repo.remove(id);
  if (!removed) {
    res.status(404).json({ error: "Usuário não encontrado" });
    return;
  }
  res.status(204).send();
});

export default router;
