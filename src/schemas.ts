import { z } from "zod";

export const authSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  type: z.string().min(1),
  password: z.string().min(1),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.email().optional(),
  type: z.string().min(1).optional(),
  password: z.string().min(1).optional(),
});
