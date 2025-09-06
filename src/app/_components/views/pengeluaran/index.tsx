"use client";
import {
  clientPengeluaranFormSchema,
  type ClientPengeluaranFormSchema,
  type PengeluaranTypeRouter,
} from "@/types/pengeluaran.type";
import {
  DashboardDescription,
  DashboardHeader,
  DashboardTitle,
} from "../../layouts/dashboard-layout-view";
import { DataTable } from "../../shared/data-table-generic";
import { columns as createColumns } from "./pengeluaran-columns";
import { api } from "@/trpc/react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PengeluaranCreateForm from "./pengeluaran-create-form";
import { toast } from "sonner";
import { PengeluaranEditDrawer } from "./pengeluaran-edit-drawer";
import type { RouterOutputs } from "@/types";
import { keepPreviousData } from "@tanstack/react-query";
import type { PaginationState } from "@tanstack/react-table";
import { Bucket, FolderBucket } from "@/server/bucket";
import { uploadFileToSignedUrl } from "@/lib/supabase";

interface PengeluaranPageViewProps {
  initialData: RouterOutputs["pengeluaran"]["getPengeluaran"];
}

export default function PengeluaranPageView({
  initialData,
}: PengeluaranPageViewProps) {
  const isMobile = useIsMobile();
  const apiUtils = api.useUtils();

  const [createFormPengeluaranOpen, setCreateFormPengeluaranOpen] =
    useState(false);
  const [deletePengeluaranDialogOpen, setDeletePengeluaranDialogOpen] =
    useState(false);
  const [selectedPengeluaranToDelete, setSelectedPengeluaranToDelete] =
    useState<{ id: string; name: string } | null>(null);
  const [editFormPengeluaranOpen, setEditFormPengeluaranOpen] = useState(false);
  const [selectedPengeluaranToEdit, setSelectedPengeluaranToEdit] =
    useState<PengeluaranTypeRouter | null>(null);
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0, // Halaman awal
    pageSize: 10, // Default item per halaman
  });

  // FORM HANDLING
  const createPengeluaranForm = useForm<ClientPengeluaranFormSchema>({
    resolver: zodResolver(clientPengeluaranFormSchema),
    defaultValues: {
      name: "",
      jumlah: 0,
      keterangan: "",
      kategoriId: "",
    },
  });
  const editPengeluaranForm = useForm<ClientPengeluaranFormSchema>({
    resolver: zodResolver(clientPengeluaranFormSchema),
  });

  // QUERIES MUTATIONS
  const { data: dataPengeluaran } = api.pengeluaran.getPengeluaran.useQuery(
    { pageIndex, pageSize },
    {
      initialData: pageIndex === 0 && pageSize === 10 ? initialData : undefined,
      placeholderData: keepPreviousData,
    },
  );
  const { mutateAsync: createPengeluaran, isPending: isPendingCreate } =
    api.pengeluaran.createPengeluaran.useMutation({
      onSuccess: async () => {
        await apiUtils.pengeluaran.getPengeluaran.invalidate();
        createPengeluaranForm.reset();
        setCreateFormPengeluaranOpen(false);
      },
      onError: (error) => {
        toast.error("Pengeluaran gagal ditambahkan", {
          description: error.message,
        });
      },
    });

  const { mutate: deletePengeluaran, isPending: isPendingDelete } =
    api.pengeluaran.deletePengeluaran.useMutation({
      onSuccess: async () => {
        await apiUtils.pengeluaran.getPengeluaran.invalidate();
        setDeletePengeluaranDialogOpen(false);
        setSelectedPengeluaranToDelete(null);
        toast.success("Pengeluaran berhasil dihapus");
      },
      onError: (error) => {
        toast.error("Pengeluaran gagal dihapus", {
          description: error.message,
        });
      },
    });

  const { mutate: updatePengeluaran, isPending: isPendingUpdate } =
    api.pengeluaran.updatePengeluaran.useMutation({
      onSuccess: async () => {
        await apiUtils.pengeluaran.getPengeluaran.invalidate();
        setEditFormPengeluaranOpen(false);
        setSelectedPengeluaranToEdit(null);
        toast.success("Pengeluaran berhasil diperbarui");
      },
      onError: (error) => {
        toast.error("Pengeluaran gagal diperbarui", {
          description: error.message,
        });
      },
    });

  const { mutateAsync: createImagePresignedUrl } =
    api.file.createImagePresignedUrl.useMutation();
  const { mutateAsync: deleteImage } = api.file.deleteImage.useMutation();

  // HANDLERS
  const handleFileUpload = async (file: File): Promise<string> => {
    const presignedData = await createImagePresignedUrl({
      originalFilename: file.name,
      context: FolderBucket.Pengeluaran,
    });

    const publicUrl = await uploadFileToSignedUrl({
      file,
      path: presignedData.path,
      token: presignedData.token,
      bucket: Bucket.ImageTransaction,
    });

    return publicUrl;
  };

  const handleSubmitCreatePengeluaran = (data: ClientPengeluaranFormSchema) => {
    if (!(data.transaksiImage instanceof File)) {
      toast.error("Anda harus mengunggah gambar bukti transaksi.");
    }

    const promise = async () => {
      const publicUrl = await handleFileUpload(data.transaksiImage as File);
      await createPengeluaran({ ...data, transaksiImageUrl: publicUrl });
    };

    toast.promise(promise(), {
      loading: "Menyimpan data...",
      success: "Pengeluaran berhasil dibuat!",
      error: (err: unknown) => {
        // 1. Cek apakah 'err' adalah instance dari kelas Error
        //    (TRPCError juga merupakan turunan dari Error, jadi ini akan berfungsi)
        if (err instanceof Error) {
          // Jika ya, TypeScript sekarang tahu bahwa `err.message` pasti ada
          return err.message;
        }

        // 2. Jika bukan, berikan pesan error default yang aman
        return "Gagal membuat pemasukan: Terjadi kesalahan tidak dikenal.";
      },
    });
  };

  const handleClickDeletePengeluaran = (
    pengeluaranId: string,
    pengeluaranName: string,
  ) => {
    setSelectedPengeluaranToDelete({
      id: pengeluaranId,
      name: pengeluaranName,
    });
    setDeletePengeluaranDialogOpen(true);
  };
  const handleSubmitDeletePengeluaran = () => {
    if (!selectedPengeluaranToDelete) return;
    deletePengeluaran({ pengeluaranId: selectedPengeluaranToDelete.id });
  };

  const handleClickEditPengeluaran = (pengeluaran: PengeluaranTypeRouter) => {
    setSelectedPengeluaranToEdit(pengeluaran);
    setEditFormPengeluaranOpen(true);

    editPengeluaranForm.reset({
      name: pengeluaran.name,
      jumlah: pengeluaran.jumlah,
      keterangan: pengeluaran.keterangan ?? "",
      kategoriId: pengeluaran.kategori.id,
      pengajuanId: pengeluaran.pengajuan?.id,
    });
  };

  const handleSubmitEditPengeluaran = (data: ClientPengeluaranFormSchema) => {
    if (!selectedPengeluaranToEdit) return;
    updatePengeluaran({ id: selectedPengeluaranToEdit.id, ...data });
  };

  const columns = createColumns({
    onEditClick: handleClickEditPengeluaran,
    onDeleteClick: handleClickDeletePengeluaran,
  });

  return (
    <>
      {/* EDIT DRAWER */}
      {selectedPengeluaranToEdit && (
        <PengeluaranEditDrawer
          isOpen={editFormPengeluaranOpen}
          setIsOpen={setEditFormPengeluaranOpen}
          form={editPengeluaranForm}
          handleSubmitEditPengeluaran={handleSubmitEditPengeluaran}
          isPending={isPendingUpdate}
        />
      )}

      {/* DELETE DIALOG */}
      <AlertDialog
        open={deletePengeluaranDialogOpen}
        onOpenChange={setDeletePengeluaranDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pengeluaran</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Yakin ingin menghapus pengeluaran{" "}
            <span className="text-accent-foreground font-bold">
              {selectedPengeluaranToDelete?.name}{" "}
            </span>
            ini? Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleSubmitDeletePengeluaran}
              disabled={isPendingDelete}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="px-4 lg:px-6">
        <DashboardHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-1">
              <DashboardTitle>Pengeluaran</DashboardTitle>
              <DashboardDescription>
                Lihat, tambah, edit, dan hapus pengeluaran sesuai kebutuhan
                Anda.
              </DashboardDescription>
            </div>

            {isMobile ? (
              <Drawer
                direction={isMobile ? "bottom" : "right"}
                open={createFormPengeluaranOpen}
                onOpenChange={setCreateFormPengeluaranOpen}
              >
                <DrawerTrigger asChild>
                  <Button>Tambah</Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader className="pb-0">
                    <DrawerTitle>Tambah Pengeluaran Baru</DrawerTitle>
                  </DrawerHeader>

                  <div className="flex flex-col overflow-y-auto p-4">
                    <Form {...createPengeluaranForm}>
                      <PengeluaranCreateForm
                        onSubmit={handleSubmitCreatePengeluaran}
                      />
                    </Form>
                  </div>

                  <DrawerFooter className="pt-2">
                    <Button
                      onClick={createPengeluaranForm.handleSubmit(
                        handleSubmitCreatePengeluaran,
                      )}
                      disabled={isPendingCreate}
                    >
                      Buat Pengeluaran
                    </Button>
                    <DrawerClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            ) : (
              <AlertDialog
                open={createFormPengeluaranOpen}
                onOpenChange={setCreateFormPengeluaranOpen}
              >
                <AlertDialogTrigger asChild>
                  <Button>Tambah Pengeluaran</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tambah Pengeluaran Baru</AlertDialogTitle>
                  </AlertDialogHeader>

                  <Form {...createPengeluaranForm}>
                    <PengeluaranCreateForm
                      onSubmit={handleSubmitCreatePengeluaran}
                    />
                  </Form>

                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button
                      onClick={createPengeluaranForm.handleSubmit(
                        handleSubmitCreatePengeluaran,
                      )}
                      disabled={isPendingCreate}
                    >
                      Buat Pengeluaran
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </DashboardHeader>

        <DataTable
          data={dataPengeluaran?.data ?? []}
          columns={columns}
          pageCount={dataPengeluaran?.pageCount ?? 0}
          pagination={{ pageIndex, pageSize }}
          onPaginationChange={setPagination}
        />
      </div>
    </>
  );
}
