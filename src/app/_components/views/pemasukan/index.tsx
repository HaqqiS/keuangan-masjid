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
} from "@/components/ui/alert-dialog";
import { Form } from "@/components/ui/form";
import PemasukanForm from "./pemasukan-form";
import { useForm } from "react-hook-form";
import { api } from "@/trpc/react";
import { PemasukanEditDrawer } from "./pamasukan-edit-drawer";
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

  console.log("Pemasukan Data:", pemasukanData);

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

  // HANDLERS
  const handleSubmitCreatePemasukan = (data: PemasukanFormSchema) => {
    createPemasukan({
      name: data.name,
      jumlah: data.jumlah,
      keterangan: data.keterangan,
      kategoriId: data.kategoriId,
    });
  };

  const handleOpenDrawer = (item: PemasukanType) => {
    setSelectedPemasukanToEdit(item); // Simpan data item yang di-klik
    setEditFormPemasukanOpen(true); // Buka drawer-nya

    editPemasukanForm.reset({
      name: item.name,
      jumlah: item.jumlah,
      keterangan: item.keterangan ?? "",
      kategoriId: item.kategori.id,
    });
  };

  const handleSubmitEditPemasukan = (data: PemasukanFormSchema) => {
    // console.log("Submit Edit Pemasukan", editPemasukanForm.getValues());
    if (!selectedPemasukanToEdit) return;

    updatePemasukan({ id: selectedPemasukanToEdit.id, ...data });
  };

  const columns = createColumns({ onEditClick: handleOpenDrawer });

  const handleClickDeletePemasukan = (pemasukanId: string) => {
    console.log(pemasukanId);
  };
  const handleSubmitDeletePemasukan = () => {
    console.log("Delete Pemasukan");
  };

  return (
    <>
      {selectedPemasukanToEdit && (
        <PemasukanEditDrawer
          isOpen={editFormPemasukanOpen}
          setIsOpen={setEditFormPemasukanOpen}
          form={editPemasukanForm}
          handleSubmitEditPemasukan={handleSubmitEditPemasukan}
          isPending={isPendingUpdate}
        />
      )}

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
