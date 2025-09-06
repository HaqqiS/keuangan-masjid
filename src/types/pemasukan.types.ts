// src/types/pemasukan.types.ts

import { z } from "zod";
import type { RouterOutputs } from ".";

// (Tipe Router Anda sudah benar)
export type PemasukanTypeRouter =
  RouterOutputs["pemasukan"]["getPemasukan"]["data"][number];

// 1. Buat skema dasar yang berisi semua field KECUALI gambar
const basePemasukanSchema = z.object({
  name: z.string().min(1, { message: "Nama pemasukan tidak boleh kosong" }),
  jumlah: z.coerce
    .number()
    .min(1, { message: "Jumlah pemasukan tidak boleh kosong" }),
  keterangan: z
    .string()
    .max(255, { message: "Keterangan tidak boleh lebih dari 255 karakter" })
    .optional(),
  kategoriId: z.string().uuid({ message: "Kategori tidak valid" }),
});

// 2. Skema untuk Form di KLIEN (fleksibel)
//    Kita tambahkan field `transaksiImage` dengan tipe `z.any()`
export const clientPemasukanFormSchema = basePemasukanSchema.extend({
  transaksiImage: z.any().optional(),
});

export type ClientPemasukanFormSchema = z.infer<
  typeof clientPemasukanFormSchema
>;

// 3. Skema untuk validasi di SERVER (ketat)
//    Kita tambahkan field `transaksiImageUrl` dengan tipe `z.string().url()`
export const serverPemasukanFormSchema = basePemasukanSchema.extend({
  transaksiImageUrl: z
    .string()
    .url({ message: "URL gambar tidak valid" })
    .optional(),
});

export type ServerPemasukanFormSchema = z.infer<
  typeof serverPemasukanFormSchema
>;
