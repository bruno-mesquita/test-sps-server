import { Request, Response } from "express";
import type { UploadedFile } from "express-fileupload";
import { attachmentService } from "../services/attachmentService";
import { storageService } from "../services/storageService";

export class AttachmentController {
  async upload(req: Request, res: Response) {
    const userId = req.params.id as string;

    const raw = req.files?.files;
    const uploadedFiles = raw ? (Array.isArray(raw) ? raw : [raw]) as UploadedFile[] : [];
    if (uploadedFiles.length === 0) return res.status(400).json({ error: "Nenhum arquivo enviado" });

    const files = await storageService.saveMany(uploadedFiles);

    const attachments = await attachmentService.createMany(userId, files);
    if (!attachments) return res.status(404).json({ error: "Usuário não encontrado" });
    return res.status(201).json(attachments);
  }

  async list(req: Request, res: Response) {
    const userId = req.params.id as string;

    const attachments = await attachmentService.listByUser(userId);
    if (!attachments) return res.status(404).json({ error: "Usuário não encontrado" });
    return res.json(attachments);
  }

  async remove(req: Request, res: Response) {
    const userId = req.params.id as string;
    const attachmentId = req.params.attachmentId as string;

    const result = await attachmentService.remove(userId, attachmentId);
    if (result === "not_found") return res.status(404).json({ error: "Anexo não encontrado" });
    return res.status(204).send();
  }
}

export const attachmentController = new AttachmentController();
