import { z } from "zod";
import type { RouterOutputs } from ".";

// 1. Buat tipe helper untuk semua output router Anda

// 2. Ambil tipe spesifik dari output endpoint 'getPengeluaran'
//    [number] digunakan untuk mengambil tipe satu objek dari array yang dikembalikan
export type PengeluaranTypeRouter =
  RouterOutputs["pemasukan"]["getPemasukan"]["data"][number];

// export type PemasukanType = {
//   id: string;
//   name: string;
//   jumlah: number; // Diubah menjadi number
//   keterangan: string | null;
//   createdAt: string; // Diubah menjadi string
//   updatedAt: string;
//   kategori: {
//     id: string;
//     name: string;
//   };
//   createdBy: {
//     id: string;
//     name: string | null;
//   };
// };

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
  transaksiImageUrl: z.string().url().optional(),
});

export type PemasukanFormSchema = z.infer<typeof pemasukanFormSchema>;
