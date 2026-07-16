 import { z } from "zod";

export const createUserSchema = z.object({
    username: z.string().min(4).max(20),
    password: z.string().min(8),
    name: z.string()
  });

export const signinSchema = z.object({
    username: z.string().min(4).max(20),
    password: z.string().min(8)
});

export const createRoomSchema = z.object({
    name: z.string().min(4).max(20)
});