import type { AppRouter } from "@/server/api/root";
import type { inferRouterOutputs } from "@trpc/server";
import { z } from "zod";

// 1. Buat tipe helper untuk semua output router Anda
type RouterOutputs = inferRouterOutputs<AppRouter>;

// 2. Ambil tipe spesifik dari output endpoint 'getPengeluaran'
//    [number] digunakan untuk mengambil tipe satu objek dari array yang dikembalikan
export type PengeluaranTypeRouter =
  RouterOutputs["pemasukan"]["getPemasukan"][number];

export type PemasukanType = {
  id: string;
  name: string;
  jumlah: number; // Diubah menjadi number
  keterangan: string | null;
  createdAt: string; // Diubah menjadi string
  updatedAt: string;
  kategori: {
    id: string;
    name: string;
  };
  createdBy: {
    id: string;
    name: string | null;
  };
};

export const pemasukanFormSchema = z.object({
  name: z.string().min(1, {
    message: "Nama pemasukan tidak boleh kosong",
  }),
  jumlah: z.coerce.number().min(1, {
    message: "Jumlah pemasukan tidak boleh kosong",
  }),
  keterangan: z
    .string()
    .max(255, { message: "Keterangan tidak boleh lebih dari 255 karakter" })
    .optional(),
  kategoriId: z.string().uuid({ message: "Kategori tidak valid" }),
});

export type PemasukanFormSchema = z.infer<typeof pemasukanFormSchema>;
