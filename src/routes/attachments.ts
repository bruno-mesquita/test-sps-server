import { Router } from "express";
import fs from "fs";
import path from "path";
import auth from "../middleware/auth";
import uploadAny from "../middleware/uploadAny";
import * as repo from "../repository";
import * as attachRepo from "../attachmentRepository";

const BASE_URL = `http://localhost:${process.env.PORT ?? 3000}`;

const router = Router();

router.post(
  "/users/:id/attachments",
  auth,
  uploadAny.array("files", 10),
  (req, res) => {
    const userId = parseInt(req.params.id as string);
    if (!repo.findById(userId)) {
      res.status(404).json({ error: "Usuário não encontrado" });
      return;
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ error: "Nenhum arquivo enviado" });
      return;
    }

    const created = files.map((file) =>
      attachRepo.createAttachment({
        userId,
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `${BASE_URL}/uploads/${file.filename}`,
      })
    );

    res.status(201).json(created);
  }
);

router.get("/users/:id/attachments", auth, (req, res) => {
  const userId = parseInt(req.params.id as string);
  if (!repo.findById(userId)) {
    res.status(404).json({ error: "Usuário não encontrado" });
    return;
  }
  res.json(attachRepo.findByUserId(userId));
});

router.delete("/users/:id/attachments/:attachmentId", auth, (req, res) => {
  const userId = parseInt(req.params.id as string);
  const attachmentId = parseInt(req.params.attachmentId as string);

  const attachment = attachRepo.findById(attachmentId);
  if (!attachment || attachment.userId !== userId) {
    res.status(404).json({ error: "Anexo não encontrado" });
    return;
  }

  const filePath = path.resolve("uploads", attachment.filename);
  fs.unlink(filePath, () => {});
  attachRepo.removeAttachment(attachmentId);

  res.status(204).send();
});

export default router;
