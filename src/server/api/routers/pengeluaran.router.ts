import { pengeluaranFormSchema } from "@/types/pengeluaran.type";
import { createTRPCRouter, protectedProcedure } from "../trpc";

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
});
