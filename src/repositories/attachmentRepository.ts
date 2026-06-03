import type { Attachment } from "../types";

type CreateInput = Omit<Attachment, "id" | "createdAt">;

let nextId = 1;

class AttachmentRepository {
  attachments: Attachment[] = [];

  async createAttachment(data: CreateInput) {
    const attachment: Attachment = {
      id: nextId++,
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

  async removeAttachment(id: number) {
    const idx = this.attachments.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    this.attachments.splice(idx, 1);
    return true;
  }
}


export const attachmentRepository = new AttachmentRepository();