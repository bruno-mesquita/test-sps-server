import fs from "fs";
import path from "path";
import { userRepository } from "../repositories/UserRepository";
import { attachmentRepository } from "../repositories/attachmentRepository";
import type { IUserRepository, IAttachmentRepository } from "../repositories/interfaces";
import type { Attachment } from "../types";

const BASE_URL = () => `http://localhost:${process.env.PORT ?? 3000}`;

export class AttachmentService {
  constructor(
    private userRepo: IUserRepository,
    private attachmentRepo: IAttachmentRepository,
  ) {}

  async createMany(
    userId: string,
    files: Express.Multer.File[],
  ): Promise<Attachment[] | null> {
    const user = await this.userRepo.findById(userId);
    if (!user) return null;

    return Promise.all(
      files.map((file) =>
        this.attachmentRepo.createAttachment({
          userId,
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: `${BASE_URL()}/uploads/${file.filename}`,
        }),
      ),
    );
  }

  async listByUser(userId: string): Promise<Attachment[] | null> {
    const user = await this.userRepo.findById(userId);
    if (!user) return null;
    return this.attachmentRepo.findByUserId(userId);
  }

  async remove(
    userId: string,
    attachmentId: string,
  ): Promise<"ok" | "not_found"> {
    const attachment = await this.attachmentRepo.findById(attachmentId);
    if (!attachment || attachment.userId !== userId) return "not_found";

    const filePath = path.resolve("uploads", attachment.filename);
    fs.unlink(filePath, () => {});
    await this.attachmentRepo.removeAttachment(attachmentId);
    return "ok";
  }
}

export const attachmentService = new AttachmentService(userRepository, attachmentRepository);
