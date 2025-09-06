/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { uploadFileToSignedUrl } from "@/lib/supabase";
import { Bucket } from "@/server/bucket";
import { api } from "@/trpc/react";
import type { PemasukanFormSchema } from "@/types/pemasukan.types";
import { TypeKategori } from "@prisma/client";
import Image from "next/image";
import type { ChangeEvent } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

type PemasukanFormProps = {
  onSubmit: (data: PemasukanFormSchema) => void;
  onChangeImageUrl: (imageUrl: string) => void;
};

export default function PemasukanForm({
  onSubmit,
  onChangeImageUrl,
}: PemasukanFormProps) {
  const form = useFormContext<PemasukanFormSchema>();

  const { data: kategoris } = api.kategori.getKategori.useQuery({
    type: TypeKategori.PEMASUKAN,
  });
  const {
    mutateAsync: createImagePresignedUrl,
    isPending: isPendingCreateImage,
  } = api.file.createImagePresignedUrl.useMutation();

  const imageChangeHandler = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      if (!file) return;

      const uploadPromise = async (): Promise<string> => {
        const { path, token } = await createImagePresignedUrl({
          originalFilename: file.name,
          context: "pemasukan",
        });

        const imageUrl = await uploadFileToSignedUrl({
          file,
          path,
          token,
          bucket: Bucket.ImageTransaction,
        });

        form.setValue("transaksiImageUrl", imageUrl, {
          shouldValidate: true,
        });

        // Cukup kembalikan hasilnya. Ini akan menjadi nilai `resolve` dari promise.
        return imageUrl;
      };

      onChangeImageUrl(await uploadPromise());

      toast.promise(uploadPromise(), {
        loading: "Mengunggah gambar...",
        success: "Gambar berhasil diunggah!",
        error: (err: any) => err.message ?? "Gagal mengunggah gambar.",
      });
    }
  };

  const imageUrl = form.watch("transaksiImageUrl");

  console.log("rendering form with imageUrl:", form.watch("transaksiImageUrl"));

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-6">
        <div className="grid gap-3">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Pemasukan</FormLabel>
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
        <div className="grid gap-6 md:grid-cols-2 md:gap-3">
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
                  <FormLabel>Kategori Pemasukan</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => field.onChange(value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {kategoris?.map((kategori) => (
                          <SelectItem key={kategori.id} value={kategori.id}>
                            {kategori.name}
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
            name="transaksiImageUrl"
            disabled={isPendingCreateImage}
            render={(field) => (
              // Kita ubah `field` menjadi `_` karena kita handle onChange manual
              <FormItem>
                <FormLabel>Upload Gambar Transaksi</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={imageChangeHandler} // Handler tetap di sini
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Format file: JPG, PNG, maksimal 10MB
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tampilkan preview jika imageUrl sudah ada */}
          {imageUrl && (
            <div className="relative mt-2 h-48 w-full rounded-md border">
              <Image
                src={imageUrl}
                alt="Preview Bukti Transaksi"
                fill
                className="rounded-md object-cover"
              />
            </div>
          )}
          {imageUrl && (
            <div className="relative mt-2 h-48 w-full rounded-md border">
              <Image
                src={imageUrl}
                alt="Preview Bukti Transaksi"
                fill
                className="rounded-md object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
