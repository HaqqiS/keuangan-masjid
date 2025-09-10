"use client";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { Form } from "@/components/ui/form";
import PengajuanForm from "../views/pengajuan/pengajuan-form";
import {
  pengajuanFormSchema,
  type PengajuanFormSchema,
} from "@/types/pengajuan.type";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/trpc/react";
import { useCreatePengajuanStore } from "@/store/useCreatePengajuan.store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

export default function CreatePengajuan() {
  const isMobile = useIsMobile();
  const apiUtils = api.useUtils();
  const { isOpen, closeForm } = useCreatePengajuanStore();

  const createPengajuanForm = useForm<PengajuanFormSchema>({
    resolver: zodResolver(pengajuanFormSchema),
    defaultValues: {
      judul: "",
      keterangan: "",
      jumlah: 0,
      kategoriId: "",
    },
  });

  const { mutateAsync: createPengajuan, isPending: isPendingCreate } =
    api.pengajuan.createPengajuan.useMutation({
      onSuccess: async () => {
        await apiUtils.pengajuan.getPengajuan.invalidate();
        closeForm();
        createPengajuanForm.reset();
      },
      onError: (error) => {
        toast.error("Pengajuan gagal dibuat", { description: error.message });
      },
    });

  const handleSubmitCreatePengajuan = async (data: PengajuanFormSchema) => {
    const promise = createPengajuan({
      judul: data.judul,
      jumlah: data.jumlah,
      kategoriId: data.kategoriId,
      keterangan: data.keterangan,
    });

    toast.promise(promise, {
      loading: "Menyimpan data...",
      success: "Pengajuan berhasil dibuat!",
      error: (err: unknown) => {
        // 1. Cek apakah 'err' adalah instance dari kelas Error
        //    (TRPCError juga merupakan turunan dari Error, jadi ini akan berfungsi)
        if (err instanceof Error) {
          // Jika ya, TypeScript sekarang tahu bahwa `err.message` pasti ada
          return err.message;
        }

        // 2. Jika bukan, berikan pesan error default yang aman
        return "Gagal membuat pengajuan: Terjadi kesalahan tidak dikenal.";
      },
    });
  };

  return (
    <>
      {isMobile ? (
        <Drawer
          direction={isMobile ? "bottom" : "right"}
          open={isOpen}
          onOpenChange={(open) => !open && closeForm()}
        >
          {/* <DrawerTrigger asChild>
            <Button>Tambah</Button>
          </DrawerTrigger> */}
          <DrawerContent>
            <DrawerHeader className="pb-0">
              <DrawerTitle>Tambah Pengajuan Pengeluaran Baru</DrawerTitle>
            </DrawerHeader>

            <div className="flex flex-col overflow-y-auto p-4">
              <Form {...createPengajuanForm}>
                <PengajuanForm onSubmit={handleSubmitCreatePengajuan} />
              </Form>
            </div>

            <DrawerFooter className="pt-2">
              <Button
                onClick={createPengajuanForm.handleSubmit(
                  handleSubmitCreatePengajuan,
                )}
                disabled={isPendingCreate}
              >
                Buat Pengajuan
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <AlertDialog
          open={isOpen}
          onOpenChange={(open) => !open && closeForm()}
        >
          {/* <AlertDialogTrigger asChild>
            <Button>Tambah Pengajuan</Button>
          </AlertDialogTrigger> */}
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Tambah Pengajuan Pengeluaran Baru
              </AlertDialogTitle>
            </AlertDialogHeader>

            <Form {...createPengajuanForm}>
              <PengajuanForm onSubmit={handleSubmitCreatePengajuan} />
            </Form>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button
                onClick={createPengajuanForm.handleSubmit(
                  handleSubmitCreatePengajuan,
                )}
                disabled={isPendingCreate}
              >
                Buat Pengajuan
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
