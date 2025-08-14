"use client";
import KategoriForm from "@/app/dashboard/kategori/kategori-form";
import {
  DashboardDescription,
  DashboardHeader,
  DashboardTitle,
} from "@/app/_components/layouts/dashboard-layout-view";
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
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { api } from "@/trpc/react";
import {
  kategoriFormSchema,
  type KategoriFormSchema,
} from "@/types/kategori.form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TypeKategori } from "@prisma/client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import KategoriCatalogCard from "./kategori-catalog-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function KategoriPage() {
  const apiUtils = api.useUtils();

  const [filterKategori, setFilterKategori] = useState<TypeKategori | "ALL">(
    "ALL",
  );
  const [createKategoriDialogOpen, setCreateKategoriDialogOpen] =
    useState(false);
  const [deleteKategoriDialogOpen, setDeleteKategoriDialogOpen] =
    useState(false);
  const [editKategoriDialogOpen, setEditKategoriDialogOpen] = useState(false);
  const [kategoriToDelete, setKategoriToDelete] = useState<string | null>(null);
  const [kategoriToEdit, setKategoriToEdit] = useState<string | null>(null);

  // FORM HOOKS
  const createKategoriForm = useForm<KategoriFormSchema>({
    resolver: zodResolver(kategoriFormSchema),
    defaultValues: {
      name: "",
      type: TypeKategori.PEMASUKAN,
    },
  });
  const editKategoriForm = useForm<KategoriFormSchema>({
    resolver: zodResolver(kategoriFormSchema),
  });

  // MUTATION
  const { data: kategoris, isLoading: isLoadingKategoris } =
    api.kategori.getKategori.useQuery({
      type: filterKategori,
    });

  const { mutate: createKategori, isPending: isPendingCreate } =
    api.kategori.createKategori.useMutation({
      onSuccess: async () => {
        await apiUtils.kategori.getKategori.invalidate();
        createKategoriForm.reset();
        setCreateKategoriDialogOpen(false);
        toast("Kategori created successfully");
      },
    });

  const { mutate: deleteKategori, isPending: isPendingDelete } =
    api.kategori.deleteKategori.useMutation({
      onSuccess: async () => {
        await apiUtils.kategori.getKategori.invalidate();
        setKategoriToDelete(null);
        setDeleteKategoriDialogOpen(false);
        toast("Kategori deleted successfully");
      },
    });

  const { mutate: editKategori, isPending: isPendingEdit } =
    api.kategori.editKategori.useMutation({
      onSuccess: async () => {
        await apiUtils.kategori.getKategori.invalidate();
        editKategoriForm.reset();
        setKategoriToEdit(null);
        setEditKategoriDialogOpen(false);
        toast("Kategori updated successfully");
      },
    });

  // HANDLER
  const handleFilterKategoriChange = (value: TypeKategori | "ALL") => {
    setFilterKategori(value);
  };

  const handleSubmitCreateKategori = (data: KategoriFormSchema) => {
    createKategori({
      name: data.name,
      type: data.type,
    });
  };

  const handleClickDeleteKategori = (kategoriId: string) => {
    setKategoriToDelete(kategoriId);
    setDeleteKategoriDialogOpen(true);
  };
  const handleSubmitDeleteKategori = () => {
    if (!kategoriToDelete) return;
    deleteKategori({ kategoriId: kategoriToDelete });
  };

  const handleClickEditKategori = (kategori: {
    id: string;
    name: string;
    type: TypeKategori;
  }) => {
    setKategoriToEdit(kategori.id);
    setEditKategoriDialogOpen(true);

    editKategoriForm.reset({
      name: kategori.name,
      type: kategori.type,
    });
  };
  const handleSubmitEditKategori = () => {
    const data = editKategoriForm.getValues();
    if (!data) return;
    editKategori({
      kategoriId: kategoriToEdit ?? "",
      name: data.name,
      type: data.type,
    });
  };

  return (
    <>
      <div className="px-4 lg:px-6">
        <DashboardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DashboardTitle>Kategori</DashboardTitle>
              <DashboardDescription>
                Lihat, tambah, edit, dan hapus kategori sesuai kebutuhan Anda.
              </DashboardDescription>
            </div>

            <AlertDialog
              open={createKategoriDialogOpen}
              onOpenChange={setCreateKategoriDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button>Tambah Kategori</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tambah Kategori Baru</AlertDialogTitle>
                </AlertDialogHeader>

                <Form {...createKategoriForm}>
                  <KategoriForm onSubmit={handleSubmitCreateKategori} />
                </Form>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <Button
                    onClick={createKategoriForm.handleSubmit(
                      handleSubmitCreateKategori,
                    )}
                    disabled={isPendingCreate}
                  >
                    Buat Kategori
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </DashboardHeader>

        <div className="space-y-4">
          <div className="flex items-center space-x-2 px-4">
            <Label>Tipe</Label>
            <Select
              defaultValue="ALL"
              onValueChange={handleFilterKategoriChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent align="end">
                <SelectItem value="ALL">ALL</SelectItem>
                {Object.keys(TypeKategori).map((type) => {
                  return (
                    <SelectItem key={type} value={type}>
                      {TypeKategori[type as keyof typeof TypeKategori]}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            {isLoadingKategoris ? (
              <div>Loading kategoris...</div>
            ) : (
              kategoris?.map((kategori) => (
                <KategoriCatalogCard
                  key={kategori.id}
                  id={kategori.id}
                  name={kategori.name}
                  type={kategori.type}
                  createdBy={kategori.createdBy.name ?? ""}
                  onDelete={() => handleClickDeleteKategori(kategori.id)}
                  onEdit={() => handleClickEditKategori(kategori)}
                />
              ))
            )}
          </div>
        </div>

        {/* EDIT DIALOG */}
        <AlertDialog
          open={editKategoriDialogOpen}
          onOpenChange={setEditKategoriDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Edit Kategori</AlertDialogTitle>
            </AlertDialogHeader>
            <Form {...editKategoriForm}>
              <KategoriForm
                onSubmit={handleSubmitEditKategori}
                // form={editKategoriForm}
              />
            </Form>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button
                onClick={editKategoriForm.handleSubmit(
                  handleSubmitEditKategori,
                )}
                disabled={isPendingEdit}
              >
                Edit Category
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* DELETE DIALOG */}
        <AlertDialog
          open={deleteKategoriDialogOpen}
          onOpenChange={setDeleteKategoriDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Kategori</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>
              Yakin ingin menghapus kategori ini? Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={handleSubmitDeleteKategori}
                disabled={isPendingDelete}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
