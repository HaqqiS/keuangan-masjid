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
import { uploadFileToSignedUrl } from "@/lib/supabase";
import { Bucket } from "@/server/bucket";
import { api } from "@/trpc/react";
import type { ClientPemasukanFormSchema } from "@/types/pemasukan.types";
import { TypeKategori } from "@prisma/client";
import Image from "next/image";
import { useMemo, type ChangeEvent } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

type PemasukanFormProps = {
  onSubmit: (data: ClientPemasukanFormSchema) => void;
};

export default function PemasukanForm({ onSubmit }: PemasukanFormProps) {
  const form = useFormContext<ClientPemasukanFormSchema>();

  const { data: kategoris } = api.kategori.getKategori.useQuery({
    type: TypeKategori.PEMASUKAN,
  });
  // const {
  //   mutateAsync: createImagePresignedUrl,
  //   isPending: isPendingCreateImage,
  // } = api.file.createImagePresignedUrl.useMutation();
  // const { mutateAsync: deleteImage } = api.file.deleteImage.useMutation();

  // const imageChangeHandler = async (e: ChangeEvent<HTMLInputElement>) => {
  //   const files = e.target.files;
  //   if (files && files.length > 0) {
  //     const file = files[0];

  //     if (!file) return;

  //     // 1. Validasi Ukuran File (contoh: maksimal 5MB)
  //     const MAX_FILE_SIZE_MB = 10;
  //     if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
  //       toast.error(`Ukuran file tidak boleh melebihi ${MAX_FILE_SIZE_MB}MB.`);
  //       e.target.value = ""; // Penting: Reset input file agar pengguna bisa memilih file lain
  //       return; // Hentikan eksekusi fungsi
  //     }

  //     // 2. Validasi Tipe File
  //     const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];
  //     if (!ALLOWED_FILE_TYPES.includes(file.type)) {
  //       toast.error(
  //         "Format file tidak valid. Harap unggah JPG, PNG, atau WebP.",
  //       );
  //       e.target.value = ""; // Reset input file
  //       return; // Hentikan eksekusi fungsi
  //     }

  //     const oldImageUrl = form.getValues("transaksiImageUrl");

  //     const uploadPromise = async (): Promise<string> => {
  //       if (oldImageUrl) {
  //         try {
  //           // Ekstrak path dari URL lengkap Supabase
  //           const urlParts = oldImageUrl.split("/");
  //           const imagePath = urlParts
  //             .slice(urlParts.indexOf(Bucket.ImageTransaction) + 1)
  //             .join("/");

  //           // console.log("Menghapus gambar lama di path:", imagePath);
  //           await deleteImage(imagePath);
  //         } catch (error) {
  //           console.error(
  //             "Gagal menghapus gambar lama, proses dihentikan:",
  //             error,
  //           );
  //           // Lemparkan error agar toast.promise menampilkannya dan menghentikan proses
  //           throw new Error("Gagal menghapus gambar lama.");
  //         }
  //       }

  //       const { path, token } = await createImagePresignedUrl({
  //         originalFilename: file.name,
  //         context: "pemasukan",
  //       });

  //       const newImageUrl = await uploadFileToSignedUrl({
  //         file,
  //         path,
  //         token,
  //         bucket: Bucket.ImageTransaction,
  //       });

  //       form.setValue("transaksiImageUrl", newImageUrl, {
  //         shouldValidate: true,
  //       });

  //       return newImageUrl;
  //     };

  //     toast.promise(uploadPromise(), {
  //       loading: "Mengunggah gambar...",
  //       success: "Gambar berhasil diunggah!",
  //       error: (err: any) => err.message ?? "Gagal mengunggah gambar.",
  //     });
  //   }
  // };

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
            <div className="relative mt-2 h-96 w-full rounded-md border md:h-48">
              <Image
                src={previewUrl}
                alt="Preview"
                fill
                className="rounded-md object-cover"
              />
            </div>
          )}
          {/* {imageUrl && (
            <div className="relative mt-2 h-96 w-full rounded-md border md:h-48">
              <Image
                src={imageUrl}
                alt="Preview Bukti Transaksi"
                fill
                className="rounded-md object-cover"
              />
            </div>
          )} */}
        </div>
      </div>
    </form>
  );
}
