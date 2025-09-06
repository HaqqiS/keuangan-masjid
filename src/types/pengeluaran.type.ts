import type { StatusPengajuan } from "@prisma/client";
import z, { string } from "zod";
import type { RouterOutputs } from ".";

export type PengeluaranTypeRouter =
  RouterOutputs["pengeluaran"]["getPengeluaran"]["data"][number];

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
