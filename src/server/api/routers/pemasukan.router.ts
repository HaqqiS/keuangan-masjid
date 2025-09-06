import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { pemasukanFormSchema } from "@/types/pemasukan.types";

export const pemasukanRouter = createTRPCRouter({
  getPemasukan: protectedProcedure
    .input(
      z.object({
        pageSize: z.number(),
        pageIndex: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { pageIndex, pageSize } = input;

      const skip = pageIndex * pageSize;

      const [pemasukan, totalCount] = await db.$transaction([
        db.pemasukan.findMany({
          skip: skip,
          take: pageSize,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            jumlah: true,
            keterangan: true,
            transaksiImageUrl: true,
            createdAt: true,
            updatedAt: true,
            createdBy: {
              select: {
                id: true,
                name: true,
              },
            },
            kategori: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        }),

        db.pemasukan.count(), // Query untuk menghitung total semua pemasukan
      ]);

      const transformedData = pemasukan.map((pemasukan) => ({
        ...pemasukan,
        jumlah: pemasukan.jumlah.toNumber(),
        createdAt: pemasukan.createdAt.toISOString(),
        updatedAt: pemasukan.updatedAt.toISOString(),
      }));

      return { data: transformedData, totalCount };
    }),

  createPemasukan: protectedProcedure
    .input(
      // z.object({
      //   name: z.string().min(1, "Nama pemasukan tidak boleh kosong"),
      //   keterangan: z.string().optional(),
      //   jumlah: z.number().min(0, "Jumlah tidak boleh negatif"),
      //   kategoriId: z.string().min(1, "Kategori tidak boleh kosong"),
      // }),
      pemasukanFormSchema,
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      const newPemasukan = await db.pemasukan.create({
        data: {
          name: input.name,
          keterangan: input.keterangan,
          jumlah: input.jumlah,
          kategoriId: input.kategoriId,
          transaksiImageUrl: input.transaksiImageUrl,
          // createdBy: { connect: { id: ctx.session.user.id } },
          createdById: ctx.session.user.id,
        },
      });

      return newPemasukan;
    }),

  deletePemasukan: protectedProcedure
    .input(z.object({ pemasukanId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { db } = ctx;

      const result = await db.pemasukan.delete({
        where: { id: input.pemasukanId },
      });

      return result;
    }),

  updatePemasukan: protectedProcedure
    .input(pemasukanFormSchema.extend({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      const result = await db.pemasukan.update({
        where: { id: input.id },
        data: {
          name: input.name,
          keterangan: input.keterangan,
          jumlah: input.jumlah,
          kategoriId: input.kategoriId,
        },
      });

      return result;
    }),
});
