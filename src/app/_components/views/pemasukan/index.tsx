"use client";

import { Button } from "@/components/ui/button";
import {
  DashboardDescription,
  DashboardHeader,
  DashboardTitle,
} from "../../layouts/dashboard-layout-view";
import { DataTable } from "../../shared/data-table-generic";
import { columns as createColumns } from "./pemasukan-columns";
import {
  clientPemasukanFormSchema,
  type ClientPemasukanFormSchema,
  // type PemasukanType,
  type PemasukanTypeRouter,
} from "@/types/pemasukan.types";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Form } from "@/components/ui/form";
import PemasukanForm from "./pemasukan-form";
import { useForm } from "react-hook-form";
import { api } from "@/trpc/react";
import { PemasukanEditDrawer } from "./pemasukan-edit-drawer";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { PaginationState } from "@tanstack/react-table";
import { keepPreviousData } from "@tanstack/react-query";
import type { RouterOutputs } from "@/types";
import { uploadFileToSignedUrl } from "@/lib/supabase";
import { Bucket } from "@/server/bucket";

interface PemasukanViewPageProps {
  initialData: RouterOutputs["pemasukan"]["getPemasukan"];
}

export function PemasukanViewPage({ initialData }: PemasukanViewPageProps) {
  const apiUtils = api.useUtils();
  const isMobile = useIsMobile();
  const [createFormPemasukanOpen, setCreateFormPemasukanOpen] = useState(false);
  const [editFormPemasukanOpen, setEditFormPemasukanOpen] = useState(false);
  const [selectedPemasukanToEdit, setSelectedPemasukanToEdit] =
    useState<PemasukanTypeRouter | null>(null);
  const [deletePemasukanDialogOpen, setDeletePemasukanDialogOpen] =
    useState(false);
  const [selectedPemasukanToDelete, setSelectedPemasukanToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0, // Halaman awal
    pageSize: 10, // Default item per halaman
  });

  // FORM HANDLING
  const createPemasukanForm = useForm<ClientPemasukanFormSchema>({
    resolver: zodResolver(clientPemasukanFormSchema),
    defaultValues: {
      name: "",
      jumlah: 0,
      keterangan: "",
      kategoriId: "",
    },
  });

  const editPemasukanForm = useForm<ClientPemasukanFormSchema>({
    resolver: zodResolver(clientPemasukanFormSchema),
  });

  // MUTATION & QUERY

  const { data: dataPemasukan, isLoading: isLoadingPemasukan } =
    api.pemasukan.getPemasukan.useQuery(
      { pageIndex, pageSize },
      {
        // initialData: initialData,
        initialData:
          pageIndex === 0 && pageSize === 10 ? initialData : undefined,
        placeholderData: keepPreviousData,
      },
    );

  const pageCount = dataPemasukan
    ? Math.ceil(dataPemasukan.totalCount / pageSize)
    : 0;

  const { mutateAsync: createPemasukan, isPending: isPendingCreate } =
    api.pemasukan.createPemasukan.useMutation({
      onSuccess: async () => {
        await apiUtils.pemasukan.getPemasukan.invalidate();
        createPemasukanForm.reset();
        setCreateFormPemasukanOpen(false);
      },
      onError: (error) => {
        toast.error("Pemasukan gagal ditambahkan", {
          description: error.message,
        });
      },
    });

  const { mutateAsync: updatePemasukan, isPending: isPendingUpdate } =
    api.pemasukan.updatePemasukan.useMutation({
      onSuccess: async () => {
        await apiUtils.pemasukan.getPemasukan.invalidate();
        setEditFormPemasukanOpen(false);
        editPemasukanForm.reset();
      },
      onError: (error) => {
        toast.error("Pengeluaran gagal diperbarui", {
          description: error.message,
        });
      },
    });

  const { mutate: deletePemasukan, isPending: isPendingDelete } =
    api.pemasukan.deletePemasukan.useMutation({
      onSuccess: async () => {
        await apiUtils.pemasukan.getPemasukan.invalidate();
        setDeletePemasukanDialogOpen(false);
        setSelectedPemasukanToDelete(null);
        toast.success("Pemasukan berhasil dihapus");
      },
      onError: (error) => {
        toast.error("Pemasukan gagal dihapus", {
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
      context: "pemasukan",
    });

    const publicUrl = await uploadFileToSignedUrl({
      file,
      path: presignedData.path,
      token: presignedData.token,
      bucket: Bucket.ImageTransaction,
    });

    return publicUrl;
  };

  const handleSubmitCreatePemasukan = async (
    data: ClientPemasukanFormSchema,
  ) => {
    if (!(data.transaksiImage instanceof File)) {
      toast.error("Anda harus mengunggah gambar bukti transaksi.");
      return;
    }

    const promise = async () => {
      const publicUrl = await handleFileUpload(data.transaksiImage as File);
      await createPemasukan({
        name: data.name,
        jumlah: data.jumlah,
        keterangan: data.keterangan,
        kategoriId: data.kategoriId,
        transaksiImageUrl: publicUrl,
      });
    };

    toast.promise(promise(), {
      loading: "Menyimpan data...",
      success: "Pemasukan berhasil dibuat!",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
      error: (err: any) => err.message ?? "Gagal membuat pemasukan.",
    });
  };

  const handleClickEditPemasukan = (pemasukan: PemasukanTypeRouter) => {
    setSelectedPemasukanToEdit(pemasukan); // Simpan data pemasukan yang di-klik
    setEditFormPemasukanOpen(true); // Buka drawer-nya

    editPemasukanForm.reset({
      name: pemasukan.name,
      jumlah: pemasukan.jumlah,
      keterangan: pemasukan.keterangan ?? "",
      kategoriId: pemasukan.kategori.id,
      transaksiImage: pemasukan.transaksiImageUrl ?? "",
    });
  };

  const handleSubmitEditPemasukan = async (data: ClientPemasukanFormSchema) => {
    if (!selectedPemasukanToEdit) return;

    // --- 2. KONSISTENSI: Menggunakan toast.promise untuk edit ---
    const promise = async () => {
      let finalImageUrl = selectedPemasukanToEdit.transaksiImageUrl;

      if (data.transaksiImage instanceof File) {
        // Hapus gambar lama jika ada
        if (selectedPemasukanToEdit.transaksiImageUrl) {
          const oldPath = selectedPemasukanToEdit.transaksiImageUrl
            .split("/")
            .slice(-2)
            .join("/");
          await deleteImage(oldPath);
        }
        // Unggah gambar baru menggunakan helper
        finalImageUrl = await handleFileUpload(data.transaksiImage);
      }

      await updatePemasukan({
        id: selectedPemasukanToEdit.id,
        name: data.name,
        jumlah: data.jumlah,
        keterangan: data.keterangan,
        kategoriId: data.kategoriId,
        transaksiImageUrl: finalImageUrl ?? "",
      });
    };

    toast.promise(promise(), {
      loading: "Memperbarui data...",
      success: "Pemasukan berhasil diperbarui!",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
      error: (err: any) => err.message ?? "Gagal memperbarui pemasukan.",
    });
  };

  const handleClickDeletePemasukan = (
    pemasukanId: string,
    pemasukanName: string,
  ) => {
    setSelectedPemasukanToDelete({ id: pemasukanId, name: pemasukanName });
    setDeletePemasukanDialogOpen(true);
  };
  const handleSubmitDeletePemasukan = () => {
    if (!selectedPemasukanToDelete) return;
    deletePemasukan({ pemasukanId: selectedPemasukanToDelete.id });
  };

  const columns = createColumns({
    onEditClick: handleClickEditPemasukan,
    onDeleteClick: handleClickDeletePemasukan,
  });

  return (
    <>
      {/* EDIT DRAWER */}
      {selectedPemasukanToEdit && (
        <PemasukanEditDrawer
          isOpen={editFormPemasukanOpen}
          setIsOpen={setEditFormPemasukanOpen}
          form={editPemasukanForm}
          handleSubmitEditPemasukan={handleSubmitEditPemasukan}
          isPending={isPendingUpdate}
        />
      )}

      {/* DELETE DIALOG */}
      <AlertDialog
        open={deletePemasukanDialogOpen}
        onOpenChange={setDeletePemasukanDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pemasukan</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Yakin ingin menghapus pemasukan{" "}
            <span className="text-accent-foreground font-bold">
              {selectedPemasukanToDelete?.name}{" "}
            </span>
            ini? Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleSubmitDeletePemasukan}
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
              <DashboardTitle>Pemasukan</DashboardTitle>
              <DashboardDescription>
                Lihat, tambah, edit, dan hapus pemasukan sesuai kebutuhan Anda.
              </DashboardDescription>
            </div>

            {isMobile ? (
              <Drawer
                direction={isMobile ? "bottom" : "right"}
                open={createFormPemasukanOpen}
                onOpenChange={setCreateFormPemasukanOpen}
              >
                <DrawerTrigger asChild>
                  <Button>Tambah</Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader className="pb-0">
                    <DrawerTitle>Tambah Pemasukan Baru</DrawerTitle>
                  </DrawerHeader>

                  <div className="flex flex-col overflow-y-auto p-4">
                    <Form {...createPemasukanForm}>
                      <PemasukanForm onSubmit={handleSubmitCreatePemasukan} />
                    </Form>
                  </div>

                  <DrawerFooter className="pt-2">
                    <Button
                      onClick={createPemasukanForm.handleSubmit(
                        handleSubmitCreatePemasukan,
                      )}
                      disabled={isPendingCreate}
                    >
                      Buat Pemasukan
                    </Button>
                    <DrawerClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            ) : (
              <AlertDialog
                open={createFormPemasukanOpen}
                onOpenChange={setCreateFormPemasukanOpen}
              >
                <AlertDialogTrigger asChild>
                  <Button>Tambah Pemasukan</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tambah Pemasukan Baru</AlertDialogTitle>
                  </AlertDialogHeader>

                  <Form {...createPemasukanForm}>
                    <PemasukanForm onSubmit={handleSubmitCreatePemasukan} />
                  </Form>

                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button
                      onClick={createPemasukanForm.handleSubmit(
                        handleSubmitCreatePemasukan,
                      )}
                      disabled={isPendingCreate}
                    >
                      Buat Pemasukan
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </DashboardHeader>

        <DataTable
          data={dataPemasukan?.data ?? []}
          columns={columns}
          pageCount={pageCount}
          pagination={{ pageIndex, pageSize }}
          onPaginationChange={setPagination}
          // isLoading={isLoadingPemasukan}
        />
      </div>
    </>
  );
}
