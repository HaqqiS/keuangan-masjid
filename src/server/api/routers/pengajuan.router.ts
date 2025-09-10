import { pengajuanFormSchema } from "@/types/pengajuan.type";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { StatusPengajuan } from "@prisma/client";
import z from "zod";

export const pengajuanRouter = createTRPCRouter({
  getPengajuan: protectedProcedure
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

      const [pengajuan, totalCount] = await db.$transaction([
        db.pengajuan.findMany({
          skip: skip,
          take: pageSize,
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
        }),
        db.pengajuan.count(),
      ]);

      const transformedData = pengajuan.map((item) => ({
        ...item,
        jumlah: item.jumlah.toNumber(),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      }));

      return { data: transformedData, totalCount };
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

      return result;
    }),

  // NANTI GANTI DENGAN PROCEDURE YANG SESUAI ROLE
  rejectPengajuan: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.pengajuan.update({
        where: { id: input.id },
        data: { status: StatusPengajuan.REJECTED },
      });
    }),

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
