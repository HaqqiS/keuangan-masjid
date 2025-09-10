"use client";
import {
  pengajuanFormSchema,
  type PengajuanFormSchema,
  type PengajuanTypeRouter,
} from "@/types/pengajuan.type";
import {
  DashboardDescription,
  DashboardHeader,
  DashboardTitle,
} from "../../layouts/dashboard-layout-view";
import { DataTable } from "../../shared/data-table-generic";
import { columns as createColumns } from "./pengajuan-column";
import { api } from "@/trpc/react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useState } from "react";
import { PengajuanEditDrawer } from "./pengajuan-edit-drawer";
import { StatusPengajuan } from "@prisma/client";
import { useSession } from "next-auth/react";
import type { RouterOutputs } from "@/types";
import { keepPreviousData } from "@tanstack/react-query";
import type { PaginationState } from "@tanstack/react-table";
import {
  clientPengeluaranFormSchema,
  type ClientPengeluaranFormSchema,
} from "@/types/pengeluaran.type";
import PengeluaranCreateForm from "../pengeluaran/pengeluaran-create-form";
import { uploadFileToSignedUrl } from "@/lib/supabase";
import { Bucket, FolderBucket } from "@/server/bucket";
import { useCreatePengajuanStore } from "@/store/useCreatePengajuan.store";

interface PengajuanPageViewProps {
  initialData: RouterOutputs["pengajuan"]["getPengajuan"];
}

export default function PengajuanPageView({
  initialData,
}: PengajuanPageViewProps) {
  const isMobile = useIsMobile();
  const apiUtils = api.useUtils();

  const session = useSession();
  const userRole = session.data?.user.role;
  const { openForm } = useCreatePengajuanStore();

  const [deletePengajuanDialogOpen, setDeletePengajuanDialogOpen] =
    useState(false);
  const [selectedPengajuanToDelete, setSelectedPengajuanToDelete] = useState<{
    pengajuanId: string;
    pengajuanJudul: string;
  } | null>(null);
  const [editFormPengajuanOpen, setEditFormPengajuanOpen] = useState(false);
  const [selectedPengajuanToEdit, setSelectedPengajuanToEdit] =
    useState<PengajuanTypeRouter | null>(null);
  const [createFormPengeluaranOpen, setCreateFormPengeluaranOpen] =
    useState(false);
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0, // Halaman awal
    pageSize: 10, // Default item per halaman
  });

  // HOOK FORMS

  const editPengajuanForm = useForm<PengajuanFormSchema>({
    resolver: zodResolver(pengajuanFormSchema),
  });

  const createPengeluaranForm = useForm<ClientPengeluaranFormSchema>({
    resolver: zodResolver(clientPengeluaranFormSchema),
  });

  // QUERIES MUTATIONS
  const { data: dataPengajuan } = api.pengajuan.getPengajuan.useQuery(
    { pageIndex, pageSize },
    {
      initialData: pageIndex === 0 && pageSize === 10 ? initialData : undefined,
      placeholderData: keepPreviousData,
    },
  );

  const pageCount = dataPengajuan
    ? Math.ceil(dataPengajuan.totalCount / pageSize)
    : 0;

  const { mutateAsync: updatePengajuan, isPending: isPendingUpdate } =
    api.pengajuan.updatePengajuan.useMutation({
      onSuccess: async () => {
        await apiUtils.pengajuan.getPengajuan.invalidate();
        setSelectedPengajuanToEdit(null);
        setEditFormPengajuanOpen(false);
        editPengajuanForm.reset();
      },
    });

  const { mutateAsync: deletePengajuan, isPending: isPendingDelete } =
    api.pengajuan.deletePengajuan.useMutation({
      onSuccess: async () => {
        await apiUtils.pengajuan.getPengajuan.invalidate();
        setSelectedPengajuanToDelete(null);
        setDeletePengajuanDialogOpen(false);
      },
    });

  const { mutateAsync: rejectPengajuan, isPending: isPendingReject } =
    api.pengajuan.rejectPengajuan.useMutation({
      onSuccess: () => apiUtils.pengajuan.getPengajuan.invalidate(),
      onError: (error) => {
        toast.error("Pengajuan gagal ditolak", { description: error.message });
      },
    });

  const {
    mutateAsync: createPengeluaranFromPengajuan,
    isPending: isPendingCreatePengeluaranFromPengajuan,
  } = api.pengeluaran.createPengeluaranFromPengajuan.useMutation({
    onSuccess: async () => {
      setCreateFormPengeluaranOpen(false);
      createPengeluaranForm.reset();
      await apiUtils.pengajuan.getPengajuan.invalidate();
      await apiUtils.pengeluaran.getPengeluaran.invalidate();
    },
  });

  const {
    mutateAsync: createPengeluaran,
    isPending: isPendingCreatePengeluaran,
  } = api.pengeluaran.createPengeluaran.useMutation({
    onSuccess: async () => {
      setCreateFormPengeluaranOpen(false);
      createPengeluaranForm.reset();
      await apiUtils.pengeluaran.getPengeluaran.invalidate();
    },
    onError: (error) => {
      toast.error("Pengeluaran gagal dibuat", { description: error.message });
    },
  });

  const { mutateAsync: createImagePresignedUrl } =
    api.file.createImagePresignedUrl.useMutation();

  const handleClickEditPengajuan = (pengajuan: PengajuanTypeRouter) => {
    setEditFormPengajuanOpen(true);
    setSelectedPengajuanToEdit(pengajuan);

    editPengajuanForm.reset({
      judul: pengajuan.judul,
      keterangan: pengajuan.keterangan ?? "",
      jumlah: pengajuan.jumlah,
      kategoriId: pengajuan.kategori.id,
    });
  };

  const handleSubmitEditPengajuan = (data: PengajuanFormSchema) => {
    if (!selectedPengajuanToEdit) return;
    const result = updatePengajuan({
      id: selectedPengajuanToEdit.id,
      ...data,
    });

    toast.promise(result, {
      loading: "Memperbarui data...",
      success: "Pengajuan berhasil diperbarui!",
      error: (err: unknown) => {
        if (err instanceof Error) {
          return err.message;
        }
        return "Gagal memperbarui pengajuan: Terjadi kesalahan tidak dikenal.";
      },
    });
  };

  const handleClickDeletePengajuan = (
    pengajuanId: string,
    pengajuanJudul: string,
  ) => {
    setSelectedPengajuanToDelete({ pengajuanId, pengajuanJudul });
    setDeletePengajuanDialogOpen(true);
  };
  const handleSubmitDeletePengajuan = () => {
    if (!selectedPengajuanToDelete) return;

    const result = deletePengajuan({
      pengajuanId: selectedPengajuanToDelete.pengajuanId,
    });

    toast.promise(result, {
      loading: "Menghapus data...",
      success: "Pengajuan berhasil dihapus!",
      error: (err: unknown) => {
        if (err instanceof Error) {
          return err.message;
        }
        return "Gagal menghapus pengajuan: Terjadi kesalahan tidak dikenal.";
      },
    });
  };

  // const handleStatusChange = async (
  //   data: PengajuanTypeRouter,
  //   status: StatusPengajuan,
  // ) => {
  //   if (status === StatusPengajuan.APPROVED) {
  //     setCreateFormPengeluaranOpen(true);

  //     createPengeluaranForm.reset({
  //       name: data.judul,
  //       jumlah: Number(data.jumlah),
  //       keterangan: data.keterangan ?? undefined,
  //       kategoriId: data.kategori.id,
  //       pengajuanId: data.id,
  //     });
  //   } else {
  //     await updateStatusPengajuan({ id: data.id, status });
  //   }
  // };
  const handleStatusChange = (
    data: PengajuanTypeRouter,
    status: StatusPengajuan,
  ) => {
    // Handler ini sekarang hanya punya DUA tugas:
    if (status === StatusPengajuan.APPROVED) {
      // 1. Jika APPROVED: Buka form finalisasi
      setCreateFormPengeluaranOpen(true);
      createPengeluaranForm.reset({
        name: data.judul,
        jumlah: Number(data.jumlah),
        keterangan: data.keterangan ?? "",
        kategoriId: data.kategori.id,
        pengajuanId: data.id,
        transaksiImage: null,
      });
    } else if (status === StatusPengajuan.REJECTED) {
      // 2. Jika REJECTED: Langsung panggil mutasi reject
      const promise = rejectPengajuan({ id: data.id });
      toast.promise(promise, {
        loading: "Menolak pengajuan...",
        success: "Pengajuan telah ditolak.",
        error: (err) =>
          err instanceof Error ? err.message : "Gagal menolak pengajuan",
      });
    }
  };

  // const handleSubmitCreatePengeluaran = (data: ClientPengeluaranFormSchema) => {
  //   const promise = async () => {
  //     await updateStatusPengajuan({
  //       id: data.pengajuanId ?? "",
  //       status: StatusPengajuan.APPROVED,
  //     });

  //     const publicUrl = await handleFileUpload(data.transaksiImage as File);
  //     await createPengeluaran({ ...data, transaksiImageUrl: publicUrl });
  //   };

  //   toast.promise(promise(), {
  //     loading: "Menyimpan data...",
  //     success: "Pengeluaran berhasil dibuat!",
  //     error: (err: unknown) => {
  //       if (err instanceof Error) {
  //         return err.message;
  //       }

  //       // 2. Jika bukan, berikan pesan error default yang aman
  //       return "Gagal membuat pengeluaran : Terjadi kesalahan tidak dikenal.";
  //     },
  //   });
  // };
  const handleSubmitCreatePengeluaran = async (
    data: ClientPengeluaranFormSchema,
  ) => {
    if (!(data.transaksiImage instanceof File)) {
      toast.error("Bukti transaksi wajib diunggah.");
      return;
    }

    const promise = async () => {
      const publicUrl = await handleFileUpload(data.transaksiImage as File);
      // Panggil mutasi BARU yang atomik
      await createPengeluaranFromPengajuan({
        name: data.name,
        jumlah: data.jumlah,
        keterangan: data.keterangan,
        kategoriId: data.kategoriId,
        pengajuanId: data.pengajuanId,
        transaksiImageUrl: publicUrl,
      });
    };

    toast.promise(promise(), {
      loading: "Menyimpan & menyelesaikan pengajuan...",
      success: "Pengeluaran berhasil dibuat!",
      error: (err) =>
        err instanceof Error ? err.message : "Gagal menyimpan pengeluaran",
    });
  };

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

  const columns = createColumns({
    onEditClick: handleClickEditPengajuan,
    onDeleteClick: handleClickDeletePengajuan,
    onStatusChange: (data, status) => {
      void handleStatusChange(data, status);
    },
    isPendingStatusChange:
      isPendingCreatePengeluaranFromPengajuan || isPendingReject,
    role: userRole,
  });

  return (
    <>
      {/* EDIT DRAWER */}
      {selectedPengajuanToEdit && (
        <PengajuanEditDrawer
          isOpen={editFormPengajuanOpen}
          setIsOpen={setEditFormPengajuanOpen}
          form={editPengajuanForm}
          handleSubmitEditPengajuan={handleSubmitEditPengajuan}
          isPending={isPendingUpdate}
        />
      )}

      {/* DELETE DIALOG */}
      <AlertDialog
        open={deletePengajuanDialogOpen}
        onOpenChange={setDeletePengajuanDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pengajuan</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Yakin ingin menghapus pengajuan{" "}
            <span className="text-accent-foreground font-bold">
              {selectedPengajuanToDelete?.pengajuanJudul}{" "}
            </span>
            ini? Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleSubmitDeletePengajuan}
              disabled={isPendingDelete}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* STATUS PENGELUARAN FORM */}
      {isMobile ? (
        <Drawer
          direction={isMobile ? "bottom" : "right"}
          open={createFormPengeluaranOpen}
          onOpenChange={setCreateFormPengeluaranOpen}
        >
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
                disabled={isPendingCreatePengeluaran}
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
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tambah Pengeluaran Baru</AlertDialogTitle>
            </AlertDialogHeader>

            <Form {...createPengeluaranForm}>
              <PengeluaranCreateForm onSubmit={handleSubmitCreatePengeluaran} />
            </Form>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button
                onClick={createPengeluaranForm.handleSubmit(
                  handleSubmitCreatePengeluaran,
                )}
                disabled={isPendingCreatePengeluaran}
              >
                Buat Pengeluaran
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <div className="px-4 lg:px-6">
        <DashboardHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-1">
              <DashboardTitle>Pengajuan</DashboardTitle>
              <DashboardDescription>
                Lihat, tambah, edit, dan hapus pengajuan sesuai kebutuhan Anda.
              </DashboardDescription>
            </div>

            {isMobile ? (
              <Button onClick={openForm}>Tambah</Button>
            ) : (
              <Button onClick={openForm}>Tambah Pengajuan</Button>
            )}
          </div>
        </DashboardHeader>

        <DataTable
          data={dataPengajuan?.data ?? []}
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
