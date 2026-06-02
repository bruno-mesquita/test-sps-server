import type { Attachment } from "./types";

type CreateInput = Omit<Attachment, "id" | "createdAt">;

let nextId = 1;
const attachments: Attachment[] = [];

export const createAttachment = (data: CreateInput): Attachment => {
  const attachment: Attachment = {
    id: nextId++,
    createdAt: new Date().toISOString(),
    ...data,
  };
  attachments.push(attachment);
  return attachment;
};

export const findByUserId = (userId: number): Attachment[] =>
  attachments.filter((a) => a.userId === userId);

export const findById = (id: number): Attachment | undefined =>
  attachments.find((a) => a.id === id);

export const removeAttachment = (id: number): boolean => {
  const idx = attachments.findIndex((a) => a.id === id);
  if (idx === -1) return false;
  attachments.splice(idx, 1);
  return true;
};
