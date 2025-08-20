import { pengajuanFormSchema } from "@/types/pengajuan.type";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { StatusPengajuan } from "@prisma/client";
import z from "zod";

export const pengajuanRouter = createTRPCRouter({
  getPengajuan: protectedProcedure.query(async ({ ctx }) => {
    const { db } = ctx;

    const pengajuan = await db.pengajuan.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        judul: true,
        keterangan: true,
        jumlah: true,
        status: true,
        kategori: { select: { id: true, name: true } },
        diajukanOleh: { select: { id: true, name: true } },
        Pengeluaran: { select: { id: true, name: true } },
        createdAt: true,
        updatedAt: true,
      },
    });

    const transformedData = pengajuan.map((item) => ({
      ...item,
      jumlah: item.jumlah.toNumber(),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));

    return transformedData;
  }),

  createPengajuan: protectedProcedure
    .input(pengajuanFormSchema)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const result = await db.pengajuan.create({
        data: {
          ...input,
          status: StatusPengajuan.PENDING,
          // diajukanOleh: { connect: { id: ctx.session.user.id } },
          diajukanOlehId: ctx.session.user.id,
        },
      });

      return result;
    }),

  updatePengajuan: protectedProcedure
    .input(pengajuanFormSchema.extend({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const result = await db.pengajuan.update({
        where: { id: input.id },
        data: {
          ...input,
        },
      });

      return result;
    }),

  deletePengajuan: protectedProcedure
    .input(z.object({ pengajuanId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      const result = await db.pengajuan.delete({
        where: { id: input.pengajuanId },
      });

      // console.log("Pengajuan deleted:", result);
      return result;
    }),

  // NANTI GANTI DENGAN PROCEDURE YANG SESUAI ROLE
  updateStatusPengajuan: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.nativeEnum(StatusPengajuan, { message: "Invalid status" }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      const result = await db.pengajuan.update({
        where: { id: input.id },
        data: { status: input.status },
      });

      return result;
    }),
});
