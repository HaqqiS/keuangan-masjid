import {
  FormControl,
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
import { useFormContext } from "react-hook-form";

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
      </div>
    </form>
  );
}
