import type { Request, Response } from "express";
import type { UploadedFile } from "express-fileupload";
import { createUserSchema, updateUserSchema } from "../schemas";
import { userService } from "../services/userService";

export class UserController {
  async list(req: Request, res: Response) {
    const output = await userService.list();
    return res.json(output);
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id as string;
    const user = await userService.getById(id);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    return res.json(user);
  }

  async create(req: Request, res: Response) {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

    const raw = req.files?.photo;
    const uploadedFile = raw ? (Array.isArray(raw) ? raw[0] : raw) as UploadedFile : undefined;

    const rawAttachments = req.files?.attachments;
    const uploadedAttachments = rawAttachments
      ? (Array.isArray(rawAttachments) ? rawAttachments : [rawAttachments]) as UploadedFile[]
      : [];

    const user = await userService.create({ ...parsed.data, file: uploadedFile, attachments: uploadedAttachments });
    if (!user) return res.status(409).json({ error: "Email já cadastrado" });
    return res.status(201).json(user);
  }

  async update(req: Request, res: Response) {
    const id = req.params.id as string;
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

    const raw = req.files?.photo;
    const uploadedFile = raw ? (Array.isArray(raw) ? raw[0] : raw) as UploadedFile : undefined;

    const rawAttachments = req.files?.attachments;
    const uploadedAttachments = rawAttachments
      ? (Array.isArray(rawAttachments) ? rawAttachments : [rawAttachments]) as UploadedFile[]
      : [];

    let removeAttachmentIds: string[] = [];
    if (req.body.removeAttachmentIds) {
      try {
        removeAttachmentIds = JSON.parse(req.body.removeAttachmentIds);
      } catch {
        return res.status(400).json({ error: "removeAttachmentIds deve ser um JSON array de IDs" });
      }
    }

    const result = await userService.update(id, {
      ...parsed.data,
      file: uploadedFile,
      attachments: uploadedAttachments,
      removeAttachmentIds,
    });
    if (!result.ok) {
      const status = result.reason === "conflict" ? 409 : 404;
      return res.status(status).json({
        error: result.reason === "conflict" ? "Email já cadastrado" : "Usuário não encontrado",
      });
    }
    return res.json(result.user);
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id as string;
    const removed = await userService.delete(id);
    if (!removed) return res.status(404).json({ error: "Usuário não encontrado" });
    return res.status(204).send();
  }

  async clearPhoto(req: Request, res: Response) {
    const id = req.params.id as string;
    const user = await userService.clearPhoto(id);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    return res.json(user);
  }
}

export const userController = new UserController();
