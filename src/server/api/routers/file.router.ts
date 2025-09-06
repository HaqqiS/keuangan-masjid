import { supabaseAdmin } from "@/server/supabase-admin";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Bucket } from "@/server/bucket";
import { TRPCError } from "@trpc/server";
import z from "zod";
import path from "node:path";
import crypto from "node:crypto";

export const fileRouter = createTRPCRouter({
  createImagePresignedUrl: protectedProcedure
    .input(
      z.object({
        originalFilename: z.string(),
        context: z.enum(["pemasukan", "pengeluaran"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const { originalFilename, context } = input;

      const userId = session.user.id;
      const extension = path.extname(originalFilename);

      const uniqueName = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
      const filePath = `${context}/${userId}-${uniqueName}${extension}`;

      const { data, error } = await supabaseAdmin.storage
        .from(Bucket.ImageTransaction)
        .createSignedUploadUrl(filePath);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      return data;
    }),

  deleteImage: protectedProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      console.log("Path Image to Delete", input);

      const { data, error } = await supabaseAdmin.storage
        .from(Bucket.ImageTransaction)
        .remove([input]);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      return data;
    }),
});
