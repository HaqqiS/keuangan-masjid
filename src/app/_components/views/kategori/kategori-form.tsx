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
import type { KategoriFormSchema } from "@/types/kategori.types";
import { TypeKategori } from "@prisma/client";
import { useFormContext } from "react-hook-form";

type KategoriFormProps = {
  onSubmit: (data: KategoriFormSchema) => void;
};

export default function KategoriForm({ onSubmit }: KategoriFormProps) {
  const form = useFormContext<KategoriFormSchema>();

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-6">
        <div className="grid gap-3">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Kategori</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Sedekah Jumat"
                    {...field}
                    autoFocus
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
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipe Kategori</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TypeKategori.PEMASUKAN}>
                        {TypeKategori.PEMASUKAN}
                      </SelectItem>
                      <SelectItem value={TypeKategori.PENGELUARAN}>
                        {TypeKategori.PENGELUARAN}
                      </SelectItem>
                    </SelectContent>
                  </Select>
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
