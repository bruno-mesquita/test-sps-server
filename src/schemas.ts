import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  type: z.string().min(1),
  password: z.string().min(1),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  type: z.string().min(1).optional(),
  password: z.string().min(1).optional(),
});
