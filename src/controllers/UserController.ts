import { Request, Response } from "express";
import { createUserSchema, updateUserSchema } from "../schemas";
import { userService } from "../services/userService";

export class UserController {
  async list(req: Request, res: Response) {
    res.json(await userService.list());
  }

  async getById(req: Request, res: Response) {
    const id = parseInt(req.params.id as string);
    const user = await userService.getById(id);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    return res.json(user);
  }

  async create(req: Request, res: Response) {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

    const user = await userService.create({ ...parsed.data, file: req.file });
    if (!user) return res.status(409).json({ error: "Email já cadastrado" });
    return res.status(201).json(user);
  }

  async update(req: Request, res: Response) {
    const id = parseInt(req.params.id as string);
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

    const result = await userService.update(id, { ...parsed.data, file: req.file });
    if (!result.ok) {
      const status = result.reason === "conflict" ? 409 : 404;
      return res.status(status).json({ error: result.reason === "conflict" ? "Email já cadastrado" : "Usuário não encontrado" });
    }
    return res.json(result.user);
  }

  async delete(req: Request, res: Response) {
    const id = parseInt(req.params.id as string);
    const removed = await userService.delete(id);
    if (!removed) return res.status(404).json({ error: "Usuário não encontrado" });
    return res.status(204).send();
  }

  async clearPhoto(req: Request, res: Response) {
    const id = parseInt(req.params.id as string);
    const user = await userService.clearPhoto(id);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    return res.json(user);
  }
}

export const userController = new UserController();
