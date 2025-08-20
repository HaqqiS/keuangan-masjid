import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { pemasukanFormSchema } from "@/types/pemasukan.types";

export const pemasukanRouter = createTRPCRouter({
  getPemasukan: protectedProcedure.query(async ({ ctx }) => {
    const { db } = ctx;

    const pemasukans = await db.pemasukan.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        jumlah: true,
        keterangan: true,
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
    });

    const transformedData = pemasukans.map((pemasukan) => ({
      ...pemasukan,
      jumlah: pemasukan.jumlah.toNumber(),
      createdAt: pemasukan.createdAt.toISOString(),
      updatedAt: pemasukan.updatedAt.toISOString(),
    }));

    return transformedData;
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
