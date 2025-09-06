import { StatusPengajuan } from "@prisma/client";
import z from "zod";
import type { RouterOutputs } from ".";

// 1. Buat tipe helper untuk semua output router Anda

// 2. Ambil tipe spesifik dari output endpoint 'getPengeluaran'
//    [number] digunakan untuk mengambil tipe satu objek dari array yang dikembalikan
export type PengajuanTypeRouter =
  RouterOutputs["pengajuan"]["getPengajuan"]["data"][number];

export const pengajuanFormSchema = z.object({
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
  kategoriId: z.string().uuid({ message: "Kategori tidak valid" }),
});

export const editStatusPengajuanFormSchema = pengajuanFormSchema.extend({
  status: z.nativeEnum(StatusPengajuan),
});

export type PengajuanFormSchema = z.infer<typeof pengajuanFormSchema>;
export type EditStatusPengajuanFormSchema = z.infer<
  typeof editStatusPengajuanFormSchema
>;
