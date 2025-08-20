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
  pemasukanFormSchema,
  type PemasukanFormSchema,
  type PemasukanType,
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

interface PemasukanViewPageProps {
  initialData: PemasukanType[]; // Menerima data sebagai prop
}

export function PemasukanViewPage({ initialData }: PemasukanViewPageProps) {
  const apiUtils = api.useUtils();
  const isMobile = useIsMobile();
  const [createFormPemasukanOpen, setCreateFormPemasukanOpen] = useState(false);
  const [editFormPemasukanOpen, setEditFormPemasukanOpen] = useState(false);
  const [selectedPemasukanToEdit, setSelectedPemasukanToEdit] =
    useState<PemasukanType | null>(null);
  const [deletePemasukanDialogOpen, setDeletePemasukanDialogOpen] =
    useState(false);
  const [selectedPemasukanToDelete, setSelectedPemasukanToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // FORM HANDLING
  const createPemasukanForm = useForm<PemasukanFormSchema>({
    resolver: zodResolver(pemasukanFormSchema),
    defaultValues: {
      name: "",
      jumlah: 0,
      keterangan: "",
      kategoriId: "",
    },
  });

  const editPemasukanForm = useForm<PemasukanFormSchema>({
    resolver: zodResolver(pemasukanFormSchema),
  });

  // MUTATION & QUERY
  const { data: pemasukanData } = api.pemasukan.getPemasukan.useQuery(
    undefined,
    { initialData: initialData },
  );

  const { mutate: createPemasukan, isPending: isPendingCreate } =
    api.pemasukan.createPemasukan.useMutation({
      onSuccess: async () => {
        await apiUtils.pemasukan.getPemasukan.invalidate();
        createPemasukanForm.reset();
        setCreateFormPemasukanOpen(false);
        toast.success("Pemasukan berhasil dibuat");
      },
      onError: (error) => {
        toast.error(`Gagal membuat Pemasukan: ${error.message}`);
      },
    });

  const { mutate: updatePemasukan, isPending: isPendingUpdate } =
    api.pemasukan.updatePemasukan.useMutation({
      onSuccess: async () => {
        await apiUtils.pemasukan.getPemasukan.invalidate();
        toast.success("Pemasukan berhasil diperbarui");
        setEditFormPemasukanOpen(false);
        editPemasukanForm.reset();
      },
      onError: (error) => {
        toast.error(`Gagal memperbarui Pemasukan: ${error.message}`);
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
        toast.error(`Gagal menghapus Pemasukan: ${error.message}`);
      },
    });

  // HANDLERS
  const handleSubmitCreatePemasukan = (data: PemasukanFormSchema) => {
    createPemasukan({
      name: data.name,
      jumlah: data.jumlah,
      keterangan: data.keterangan,
      kategoriId: data.kategoriId,
    });
  };

  const handleClickEditPemasukan = (pemasukan: PemasukanType) => {
    setSelectedPemasukanToEdit(pemasukan); // Simpan data pemasukan yang di-klik
    setEditFormPemasukanOpen(true); // Buka drawer-nya

    editPemasukanForm.reset({
      name: pemasukan.name,
      jumlah: pemasukan.jumlah,
      keterangan: pemasukan.keterangan ?? "",
      kategoriId: pemasukan.kategori.id,
    });
  };

  const handleSubmitEditPemasukan = (data: PemasukanFormSchema) => {
    // console.log("Submit Edit Pemasukan", editPemasukanForm.getValues());
    if (!selectedPemasukanToEdit) return;

    updatePemasukan({ id: selectedPemasukanToEdit.id, ...data });
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

        <DataTable data={pemasukanData} columns={columns} />
      </div>
    </>
  );
}
