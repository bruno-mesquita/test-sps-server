import fs from "fs";
import path from "path";
import { attachmentRepository } from "../repositories/attachmentRepository";
import { userRepository } from "../repositories/UserRepository";
import type { Attachment } from "../types";

const BASE_URL = () => `http://localhost:${process.env.PORT ?? 3000}`;

export class AttachmentService {
  async createMany(
    userId: number,
    files: Express.Multer.File[],
  ): Promise<Attachment[] | null> {
    const user = await userRepository.findById(userId);
    if (!user) return null;

    return Promise.all(
      files.map((file) =>
        attachmentRepository.createAttachment({
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

  async listByUser(userId: number): Promise<Attachment[] | null> {
    const user = await userRepository.findById(userId);
    if (!user) return null;
    return attachmentRepository.findByUserId(userId);
  }

  async remove(
    userId: number,
    attachmentId: number,
  ): Promise<"ok" | "not_found"> {
    const attachment = await attachmentRepository.findById(attachmentId);
    if (!attachment || attachment.userId !== userId) return "not_found";

    const filePath = path.resolve("uploads", attachment.filename);
    fs.unlink(filePath, () => {});
    await attachmentRepository.removeAttachment(attachmentId);
    return "ok";
  }
}

export const attachmentService = new AttachmentService();
