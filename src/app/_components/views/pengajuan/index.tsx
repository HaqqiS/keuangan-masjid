"use client";
import {
  createPengajuanFormSchema,
  type CreatePengajuanFormSchema,
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

  // HOOK FORMS
  const createPengajuanForm = useForm<CreatePengajuanFormSchema>({
    resolver: zodResolver(createPengajuanFormSchema),
    defaultValues: {
      judul: "",
      keterangan: "",
      jumlah: 0,
      kategoriId: "",
    },
  });

  // QUERIES MUTATIONS
  const { data: dataPengajuan, isLoading: isLoadingPengajuan } =
    api.pengajuan.getPengajuan.useQuery(undefined, {
      initialData: initialData,
    });

  const { mutate: createPengajuan, isPending: isPendingCreate } =
    api.pengajuan.createPengajuan.useMutation({
      onSuccess: async () => {
        await apiUtils.pengajuan.getPengajuan.invalidate();
        setCreateFormPengajuanOpen(false);
        createPengajuanForm.reset();
        toast.success("Pengajuan berhasil dibuat");
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

  // HANDLERS
  const handleSubmitCreatePengajuan = (data: CreatePengajuanFormSchema) => {
    createPengajuan(data);
  };

  const handleClickEditPengajuan = () => {
    console.log("Edit");
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

  const columns = createColumns({
    onEditClick: handleClickEditPengajuan,
    onDeleteClick: handleClickDeletePengajuan,
  });

  return (
    <>
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
                      // disabled={isPendingCreate}
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
                  <Button>Tambah Pemasukan</Button>
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
