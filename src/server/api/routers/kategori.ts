import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { type Prisma, TypeKategori } from "@prisma/client";

export const kategoriRouter = createTRPCRouter({
  getKategori: protectedProcedure
    .input(
      z.object({
        type: z.enum(["ALL", ...Object.keys(TypeKategori)]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;

      const whereClause: Prisma.KategoriWhereInput = {};
      switch (input.type) {
        case TypeKategori.PEMASUKAN:
          whereClause.type = TypeKategori.PEMASUKAN;
          break;
        case TypeKategori.PENGELUARAN:
          whereClause.type = TypeKategori.PENGELUARAN;
          break;
      }

      const kategoris = await db.kategori.findMany({
        where: whereClause,
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          type: true,
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return kategoris;
    }),

  createKategori: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Nama kategori tidak boleh kosong"),
        type: z.enum([TypeKategori.PEMASUKAN, TypeKategori.PENGELUARAN], {
          required_error: "Tipe kategori harus dipilih",
        }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { db } = ctx;

      const result = await db.kategori.create({
        data: {
          name: input.name,
          type: input.type,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
      return result;
    }),
  deleteKategori: protectedProcedure
    .input(z.object({ kategoriId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { db } = ctx;

      const result = await db.kategori.delete({
        where: { id: input.kategoriId },
      });
      return result;
    }),

  editKategori: protectedProcedure
    .input(
      z.object({
        kategoriId: z.string().uuid(),
        name: z.string().min(1, "Nama kategori tidak boleh kosong"),
        type: z.enum([TypeKategori.PEMASUKAN, TypeKategori.PENGELUARAN], {
          required_error: "Tipe kategori harus dipilih",
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { kategoriId, name, type } = input;

      const result = await db.kategori.update({
        where: { id: kategoriId },
        data: {
          name,
          type,
        },
      });
    }),
});
