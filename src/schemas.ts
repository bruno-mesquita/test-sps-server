import type { UploadedFile } from "express-fileupload";
import { z } from "zod";

export const authSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

const parseJsonArray = (val: unknown) => {
  if (typeof val !== "string") return val;
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [val];
  }
};

const normalizeFile = (val: unknown) => {
  if (!val) return undefined;
  return Array.isArray(val) ? val[0] : val;
};

const normalizeAttachments = (val: unknown) => {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
};

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  type: z.string().min(1),
  password: z.string().min(1),
  file: z.preprocess(normalizeFile, z.custom<UploadedFile>()).optional(),
  attachments: z.preprocess(normalizeAttachments, z.array(z.custom<UploadedFile>())).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.email().optional(),
  type: z.string().min(1).optional(),
  password: z.string().min(1).optional(),
  removeAttachmentIds: z.preprocess(parseJsonArray, z.array(z.string())).optional(),
  file: z.preprocess(normalizeFile, z.custom<UploadedFile>()).optional(),
  attachments: z.preprocess(normalizeAttachments, z.array(z.custom<UploadedFile>())).optional(),
});
