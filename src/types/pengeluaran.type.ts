import type { AppRouter } from "@/server/api/root";
import type { StatusPengajuan } from "@prisma/client";
import type { inferRouterOutputs } from "@trpc/server";
import z, { string } from "zod";

// 1. Buat tipe helper untuk semua output router Anda
type RouterOutputs = inferRouterOutputs<AppRouter>;

// 2. Ambil tipe spesifik dari output endpoint 'getPengeluaran'
//    [number] digunakan untuk mengambil tipe satu objek dari array yang dikembalikan
export type PengeluaranTypeRouter =
  RouterOutputs["pengeluaran"]["getPengeluaran"][number];

export type PengeluaranType = {
  id: string;
  name: string;
  jumlah: number;
  keterangan: string | null;
  createdBy: {
    id: string;
    name: string | null;
  };
  kategori: {
    id: string;
    name: string;
  };
  pengajuan: {
    id: string;
    status: StatusPengajuan;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export const pengeluaranFormSchema = z.object({
  name: string().min(1, { message: "Nama pengeluaran tidak boleh kosong" }),
  jumlah: z.coerce
    .number()
    .min(1, { message: "Jumlah pengeluaran tidak boleh kosong" }),
  keterangan: string()
    .max(255, { message: "Keterangan tidak boleh lebih dari 255 karakter" })
    .optional(),
  kategoriId: z.string().uuid({ message: "Kategori tidak valid" }),
  pengajuanId: z.string().uuid().optional(),
});

export const editPengeluaranFormSchema = pengeluaranFormSchema.extend({
  pengajuanId: z
    .string()
    .uuid({ message: "Pengajuan tidak valid" })
    .nullable()
    .optional(),
});

export type PengeluaranFormSchema = z.infer<typeof pengeluaranFormSchema>;
export type EditPengeluaranFormSchema = z.infer<
  typeof editPengeluaranFormSchema
>;
