import { z } from "zod";

// 2. TIPE KLIEN: Data yang siap digunakan oleh komponen UI seperti DataTable
// Tipe ini adalah tujuan akhir dari proses transformasi kita.
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
  kategoriId: z.string().uuid(),
});

export type PemasukanFormSchema = z.infer<typeof pemasukanFormSchema>;
