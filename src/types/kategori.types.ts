import { TypeKategori } from "@prisma/client";
import { z } from "zod";

export type KategoriType = {
  id: string;
  name: string;
  type: TypeKategori;
  createdBy: {
    id: string;
    name: string | null;
  };
};

export const kategoriFormSchema = z.object({
  name: z.string().min(1, {
    message: "Nama kategori tidak boleh kosong",
  }),
  type: z.enum([TypeKategori.PEMASUKAN, TypeKategori.PENGELUARAN], {
    required_error: "Tipe kategori harus dipilih",
  }),
});

export type KategoriFormSchema = z.infer<typeof kategoriFormSchema>;
