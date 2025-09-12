import { registerFormSchema } from "@/types/user.types";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";

export const userRouter = createTRPCRouter({
  registerPengurus: publicProcedure
    .input(registerFormSchema)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      const { email, name, password } = input;

      // 3. Cek apakah user dengan email ini sudah ada
      const existingUser = await db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT", // Kode error CONFLICT (409) cocok untuk ini
          message: "Email ini sudah terdaftar. Silakan gunakan email lain.",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newPengurus = db.user.create({
        data: {
          name: name,
          email: email,
          password: hashedPassword,
        },
      });

      return newPengurus;
    }),
});
