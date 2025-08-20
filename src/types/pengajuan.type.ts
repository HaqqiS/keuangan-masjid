import type { AppRouter } from "@/server/api/root";
import { StatusPengajuan } from "@prisma/client";
import type { inferRouterOutputs } from "@trpc/server";
import z from "zod";

// 1. Buat tipe helper untuk semua output router Anda
type RouterOutputs = inferRouterOutputs<AppRouter>;

// 2. Ambil tipe spesifik dari output endpoint 'getPengeluaran'
//    [number] digunakan untuk mengambil tipe satu objek dari array yang dikembalikan
export type PengajuanTypeRouter =
  RouterOutputs["pengajuan"]["getPengajuan"][number];

export const createPengajuanFormSchema = z.object({
  judul: z.string().min(1, { message: "Judul tidak boleh kosong" }),
  keterangan: z.string().max(255).optional(),
  jumlah: z.coerce
    .number({ invalid_type_error: "Hanya boleh angka" })
    .min(1, { message: "Jumlah tidak boleh kosong atau selain angka" }),
  // status: z
  //   .enum(
  //     [
  //       StatusPengajuan.PENDING,
  //       StatusPengajuan.APPROVED,
  //       StatusPengajuan.REJECTED,
  //     ],`
  //     { required_error: "Status harus dipilih" },
  //   )
  //   .default(StatusPengajuan.PENDING),
  kategoriId: z.string().uuid(),
});

export const editPengajuanFormSchema = createPengajuanFormSchema.extend({
  status: z.nativeEnum(StatusPengajuan),
});

export type CreatePengajuanFormSchema = z.infer<
  typeof createPengajuanFormSchema
>;
export type EditPengajuanFormSchema = z.infer<typeof editPengajuanFormSchema>;
