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
  DrawerTrigger,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PengajuanForm from "./pengajuan-form";
import { toast } from "sonner";
import { useState } from "react";
import { PengajuanEditDrawer } from "./pengajuna-edit-drawer";
import type { StatusPengajuan } from "@prisma/client";

interface PengajuanPageViewProps {
  initialData: PengajuanTypeRouter[];
}

export default function PengajuanPageView({
  initialData,
}: PengajuanPageViewProps) {
  const isMobile = useIsMobile();
  const apiUtils = api.useUtils();

  const [createFormPengajuanOpen, setCreateFormPengajuanOpen] = useState(false);
  const [deletePengajuanDialogOpen, setDeletePengajuanDialogOpen] =
    useState(false);
  const [selectedPengajuanToDelete, setSelectedPengajuanToDelete] = useState<{
    pengajuanId: string;
    pengajuanJudul: string;
  } | null>(null);
  const [editFormPengajuanOpen, setEditFormPengajuanOpen] = useState(false);
  const [selectedPengajuanToEdit, setSelectedPengajuanToEdit] =
    useState<PengajuanTypeRouter | null>(null);

  // HOOK FORMS
  const createPengajuanForm = useForm<PengajuanFormSchema>({
    resolver: zodResolver(pengajuanFormSchema),
    defaultValues: {
      judul: "",
      keterangan: "",
      jumlah: 0,
      kategoriId: "",
    },
  });

  const editPengajuanForm = useForm<PengajuanFormSchema>({
    resolver: zodResolver(pengajuanFormSchema),
  });

  // QUERIES MUTATIONS
  const { data: dataPengajuan } = api.pengajuan.getPengajuan.useQuery(
    undefined,
    { initialData: initialData },
  );

  const { mutate: createPengajuan, isPending: isPendingCreate } =
    api.pengajuan.createPengajuan.useMutation({
      onSuccess: async () => {
        await apiUtils.pengajuan.getPengajuan.invalidate();
        setCreateFormPengajuanOpen(false);
        createPengajuanForm.reset();
        toast.success("Pengajuan berhasil dibuat");
      },
      onError: (error) => {
        toast.error("Pengajuan gagal dibuat", { description: error.message });
      },
    });

  const { mutate: updatePengajuan, isPending: isPendingUpdate } =
    api.pengajuan.updatePengajuan.useMutation({
      onSuccess: async () => {
        await apiUtils.pengajuan.getPengajuan.invalidate();
        toast.success("Pengajuan berhasil diperbarui");
        setSelectedPengajuanToEdit(null);
        setEditFormPengajuanOpen(false);
        editPengajuanForm.reset();
      },
    });

  const { mutate: deletePengajuan, isPending: isPendingDelete } =
    api.pengajuan.deletePengajuan.useMutation({
      onSuccess: async () => {
        await apiUtils.pengajuan.getPengajuan.invalidate();
        toast.success("Pengajuan berhasil dihapus");
        setSelectedPengajuanToDelete(null);
        setDeletePengajuanDialogOpen(false);
      },
    });

  const { mutate: updateStatusPengajuan, isPending: isPendingUpdateStatus } =
    api.pengajuan.updateStatusPengajuan.useMutation({
      onSuccess: async () => {
        await apiUtils.pengajuan.getPengajuan.invalidate();
        toast.success("Status pengajuan berhasil diperbarui");
      },
      onError: (error) => {
        toast.error("Status pengajuan gagal diperbarui", {
          description: error.message,
        });
      },
    });

  // HANDLERS
  const handleSubmitCreatePengajuan = (data: PengajuanFormSchema) => {
    createPengajuan(data);
  };

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
    console.table(data);
    updatePengajuan({
      id: selectedPengajuanToEdit.id,
      ...data,
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

    deletePengajuan({ pengajuanId: selectedPengajuanToDelete.pengajuanId });
  };

  const handleStatusChange = (pengajuanId: string, status: StatusPengajuan) => {
    updateStatusPengajuan({ id: pengajuanId, status });
  };

  const columns = createColumns({
    onEditClick: handleClickEditPengajuan,
    onDeleteClick: handleClickDeletePengajuan,
    onStatusChange: handleStatusChange,
    isPendingStatusChange: isPendingUpdateStatus,
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
              <Drawer
                direction={isMobile ? "bottom" : "right"}
                open={createFormPengajuanOpen}
                onOpenChange={setCreateFormPengajuanOpen}
              >
                <DrawerTrigger asChild>
                  <Button>Tambah</Button>
                </DrawerTrigger>
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
                open={createFormPengajuanOpen}
                onOpenChange={setCreateFormPengajuanOpen}
              >
                <AlertDialogTrigger asChild>
                  <Button>Tambah Pengajuan</Button>
                </AlertDialogTrigger>
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
                      // disabled={isPendingCreate}
                    >
                      Buat Pengajuan
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </DashboardHeader>

        <DataTable data={dataPengajuan} columns={columns} />
      </div>
    </>
  );
}
