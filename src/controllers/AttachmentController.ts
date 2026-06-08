import { Request, Response } from "express";
import { attachmentService } from "../services/attachmentService";

function canActOnUser(req: Request, userId: string): boolean {
  return req.user!.id === userId || req.user!.type === "admin";
}

export class AttachmentController {
  async upload(req: Request, res: Response) {
    const userId = req.params.id as string;
    if (!canActOnUser(req, userId)) return res.status(403).json({ error: "Acesso negado" });

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) return res.status(400).json({ error: "Nenhum arquivo enviado" });

    const attachments = await attachmentService.createMany(userId, files);
    if (!attachments) return res.status(404).json({ error: "Usuário não encontrado" });
    return res.status(201).json(attachments);
  }

  async list(req: Request, res: Response) {
    const userId = req.params.id as string;
    if (!canActOnUser(req, userId)) return res.status(403).json({ error: "Acesso negado" });

    const attachments = await attachmentService.listByUser(userId);
    if (!attachments) return res.status(404).json({ error: "Usuário não encontrado" });
    return res.json(attachments);
  }

  async remove(req: Request, res: Response) {
    const userId = req.params.id as string;
    const attachmentId = req.params.attachmentId as string;
    if (!canActOnUser(req, userId)) return res.status(403).json({ error: "Acesso negado" });

    const result = await attachmentService.remove(userId, attachmentId);
    if (result === "not_found") return res.status(404).json({ error: "Anexo não encontrado" });
    return res.status(204).send();
  }
}

export const attachmentController = new AttachmentController();
