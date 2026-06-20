import type { Attachment } from "../../types";
import type { IAttachmentRepository } from "../interfaces";

type CreateInput = Omit<Attachment, "id" | "createdAt">;

export class InMemoryAttachmentRepository implements IAttachmentRepository {
  attachments: Attachment[] = [];

  async createAttachment(data: CreateInput) {
    const attachment: Attachment = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...data,
    };
    this.attachments.push(attachment);
    return attachment;
  }

  async findByUserId(userId: string) {
    return this.attachments.filter((a) => a.userId === userId);
  }

  async findById(id: string) {
    return this.attachments.find((a) => a.id === id);
  }

  async getCountByUserId(userId: string) {
    return this.attachments.filter((a) => a.userId === userId).length;
  }

  async removeAttachment(id: string) {
    const idx = this.attachments.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    this.attachments.splice(idx, 1);
    return true;
  }

  reset() {
    this.attachments = [];
  }
}
