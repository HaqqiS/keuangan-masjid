import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  root: z.string().optional(),
});

export const registerFormSchema = loginFormSchema.extend({
  name: z.string().min(1, "Nama tidak boleh kosong"),
});

export type LoginFormSchema = z.infer<typeof loginFormSchema>;

export type RegisterFormSchema = z.infer<typeof registerFormSchema>;
