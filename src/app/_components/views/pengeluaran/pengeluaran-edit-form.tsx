/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import type { ClientPengeluaranFormSchema } from "@/types/pengeluaran.type";
import { TypeKategori } from "@prisma/client";
import Image from "next/image";
import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

type PengeluaranEditFormProps = {
  onSubmit: (data: ClientPengeluaranFormSchema) => void;
};

export default function PengeluaranEditForm({
  onSubmit,
}: PengeluaranEditFormProps) {
  const form = useFormContext<ClientPengeluaranFormSchema>();

  const { data: kategoris } = api.kategori.getKategori.useQuery({
    type: TypeKategori.PENGELUARAN,
  });

  const { data: pengajuans } = api.pengajuan.getPengajuan.useQuery({
    pageSize: 50,
    pageIndex: 0,
  });

  const transaksiImageValue = form.watch("transaksiImage");

  const previewUrl = useMemo(() => {
    if (typeof transaksiImageValue === "string") {
      return transaksiImageValue; // Jika string, itu adalah URL yang sudah ada
    }
    if (transaksiImageValue instanceof File) {
      return URL.createObjectURL(transaksiImageValue); // Jika File, buat URL preview
    }
    return null; // Jika kosong
  }, [transaksiImageValue]);

  const imageChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_FILE_SIZE_MB = 10;
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`Ukuran file tidak boleh melebihi ${MAX_FILE_SIZE_MB}MB.`);
      e.target.value = ""; // Penting: Reset input agar user bisa memilih file lagi
      return; // Hentikan proses
    }

    const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error("Format file harus JPG, PNG, atau WebP.");
      e.target.value = ""; // Reset input
      return; // Hentikan proses
    }

    // Langsung simpan objek File ke dalam state form
    form.setValue("transaksiImage", file, { shouldValidate: true });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-6">
        <div className="grid gap-3">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Pengeluaran</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Infaq Jumat Pertama"
                    {...field}
                    required
                    autoFocus
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-3">
          <FormField
            control={form.control}
            name="jumlah"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jumlah</FormLabel>
                <FormControl>
                  <Input
                    placeholder="1000000"
                    type="number"
                    {...field}
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-3">
          <FormField
            control={form.control}
            name="kategoriId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategori Pengeluaran</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder="Pilih kategori"
                        className="break-words whitespace-normal"
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {kategoris?.map((kategori) => (
                        <SelectItem key={kategori.id} value={kategori.id}>
                          <span className="break-words whitespace-normal">
                            {kategori.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-3">
          <FormField
            control={form.control}
            name="pengajuanId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pengajuan</FormLabel>
                <FormControl>
                  <Select
                    value={field.value ?? "none"}
                    onValueChange={(value) => {
                      field.onChange(value === "none" ? null : value);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih pengajuan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <span className="text-muted-foreground">Tidak Ada</span>
                      </SelectItem>
                      {pengajuans?.data?.map((pengajuan) => (
                        <SelectItem key={pengajuan.id} value={pengajuan.id}>
                          {pengajuan.judul}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-3">
          <FormField
            control={form.control}
            name="keterangan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Keterangan</FormLabel>
                <FormControl>
                  <Textarea placeholder="Masukkan keterangan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-3">
          <FormField
            control={form.control}
            name="transaksiImage"
            // disabled={isPendingCreateImage}
            render={() => (
              // Kita ubah `field` menjadi `_` karena kita handle onChange manual
              <FormItem>
                <FormLabel>Upload Gambar Transaksi</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={imageChangeHandler} // Handler tetap di sini
                    // {...field}
                  />
                </FormControl>
                <FormDescription>
                  Format file: JPG, PNG, maksimal 10MB
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {previewUrl && (
            <div className="relative mt-2 h-fit w-full rounded-md border md:h-48">
              <Image
                src={previewUrl}
                alt="Preview"
                height={384}
                width={384}
                // className="rounded-md object-cover"
                className="h-auto w-auto rounded-md object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
