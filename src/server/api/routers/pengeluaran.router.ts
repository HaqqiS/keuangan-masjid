import { serverPengeluaranFormSchema } from "@/types/pengeluaran.type";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import z from "zod";
import { Bucket } from "@/server/bucket";
import { fileRouter } from "./file.router";
import { TRPCError } from "@trpc/server";

export const pengeluaranRouter = createTRPCRouter({
  getPengeluaran: protectedProcedure
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
      const [pengeluaran, totalCount] = await db.$transaction([
        db.pengeluaran.findMany({
          skip: skip,
          take: pageSize,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            jumlah: true,
            keterangan: true,
            transaksiImageUrl: true,
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
        }),
        db.pengeluaran.count(),
      ]);

      const transformedData = pengeluaran.map((pengeluaran) => ({
        ...pengeluaran,
        jumlah: pengeluaran.jumlah.toNumber(),
        createdAt: pengeluaran.createdAt.toISOString(),
        updatedAt: pengeluaran.updatedAt.toISOString(),
      }));

      const pageCount = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 0;

      return {
        data: transformedData,
        // totalCount,
        pageCount,
      };
    }),

  createPengeluaran: protectedProcedure
    .input(serverPengeluaranFormSchema)
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
          transaksiImageUrl: input.transaksiImageUrl,
        },
      });

      return newPengeluaran;
    }),

  createPengeluaranFromPengajuan: protectedProcedure
    .input(serverPengeluaranFormSchema)
    .mutation(async ({ input, ctx }) => {
      const { db, session } = ctx;
      if (!input.pengajuanId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Pengajuan ID wajib diisi.",
        });
      }

      // Gunakan $transaction untuk menjamin atomicity
      return db.$transaction(async (prisma) => {
        // 1. Update status pengajuan menjadi APPROVED
        await prisma.pengajuan.update({
          where: { id: input.pengajuanId! },
          data: { status: "APPROVED" },
        });

        // 2. Buat record pengeluaran baru
        const newPengeluaran = await prisma.pengeluaran.create({
          data: {
            name: input.name,
            jumlah: input.jumlah,
            keterangan: input.keterangan,
            kategoriId: input.kategoriId,
            transaksiImageUrl: input.transaksiImageUrl,
            createdById: session.user.id,
            pengajuanId: input.pengajuanId,
          },
        });

        return newPengeluaran;
      });
    }),

  deletePengeluaran: protectedProcedure
    .input(z.object({ pengeluaranId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const pengeluaran = await db.pengeluaran.findUnique({
        where: { id: input.pengeluaranId },
        select: { transaksiImageUrl: true },
      });

      if (pengeluaran?.transaksiImageUrl) {
        const urlParts = pengeluaran.transaksiImageUrl.split("/");
        // Ambil path setelah nama bucket, misal: "pemasukan/user_id-timestamp-random.jpg"
        const imagePath = urlParts
          .slice(urlParts.indexOf(Bucket.ImageTransaction) + 1)
          .join("/");

        // console.log("Path Image to Delete di Router:", imagePath);

        // 2. Buat "caller" untuk fileRouter
        const fileCaller = fileRouter.createCaller(ctx);

        // 3. Panggil prosedur deleteImage melalui caller
        await fileCaller.deleteImage(imagePath);
      }

      const result = await db.pengeluaran.delete({
        where: { id: input.pengeluaranId },
      });

      return result;
    }),

  updatePengeluaran: protectedProcedure
    .input(
      serverPengeluaranFormSchema.extend({
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
          transaksiImageUrl: input.transaksiImageUrl,
        },
      });

      return result;
    }),
});
