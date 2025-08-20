import {
  editPengeluaranFormSchema,
  pengeluaranFormSchema,
} from "@/types/pengeluaran.type";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import z from "zod";

export const pengeluaranRouter = createTRPCRouter({
  getPengeluaran: protectedProcedure.query(async ({ ctx }) => {
    const { db } = ctx;
    const pengeluaran = await db.pengeluaran.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        jumlah: true,
        keterangan: true,
        pengajuan: {
          select: {
            id: true,
            status: true,
            diajukanOleh: { select: { id: true, name: true } },
          },
        },
        kategori: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    const transformedData = pengeluaran.map((pengeluaran) => ({
      ...pengeluaran,
      jumlah: pengeluaran.jumlah.toNumber(),
      createdAt: pengeluaran.createdAt.toISOString(),
      updatedAt: pengeluaran.updatedAt.toISOString(),
    }));

    return transformedData;
  }),

  createPengeluaran: protectedProcedure
    .input(pengeluaranFormSchema)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      const newPengeluaran = await db.pengeluaran.create({
        data: {
          name: input.name,
          jumlah: input.jumlah,
          keterangan: input.keterangan,
          kategoriId: input.kategoriId,
          pengajuanId: input.pengajuanId,
          createdById: ctx.session.user.id,
        },
      });

      return newPengeluaran;
    }),

  deletePengeluaran: protectedProcedure
    .input(
      z.object({
        pengeluaranId: z.string().uuid({ message: "ID tidak valid" }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      const result = await db.pengeluaran.delete({
        where: { id: input.pengeluaranId },
      });

      return result;
    }),

  updatePengeluaran: protectedProcedure
    .input(
      editPengeluaranFormSchema.extend({
        id: z.string().uuid({ message: "ID tidak valid" }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      const result = await db.pengeluaran.update({
        where: { id: input.id },
        data: {
          name: input.name,
          jumlah: input.jumlah,
          keterangan: input.keterangan,
          kategoriId: input.kategoriId,
          pengajuanId: input.pengajuanId ?? null,
        },
      });

      return result;
    }),
});
