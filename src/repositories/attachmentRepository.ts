import type { Attachment } from "../types";
import type { IAttachmentRepository } from "./interfaces";

type CreateInput = Omit<Attachment, "id" | "createdAt">;

export class AttachmentRepository implements IAttachmentRepository {
  private nextId = 1;
  attachments: Attachment[] = [];

  async createAttachment(data: CreateInput) {
    const attachment: Attachment = {
      id: this.nextId++,
      createdAt: new Date().toISOString(),
      ...data,
    };
    this.attachments.push(attachment);
    return attachment;
  }

  async findByUserId(userId: number) {
    return this.attachments.filter((a) => a.userId === userId);
  }

  async findById(id: number) {
    return this.attachments.find((a) => a.id === id);
  }

  async getCountByUserId(userId: number) {
    return this.attachments.filter((a) => a.userId === userId).length;
  }

  async removeAttachment(id: number) {
    const idx = this.attachments.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    this.attachments.splice(idx, 1);
    return true;
  }

  reset() {
    this.attachments = [];
    this.nextId = 1;
  }
}

export const attachmentRepository = new AttachmentRepository();
