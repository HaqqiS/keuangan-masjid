"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { ClientPengeluaranFormSchema } from "@/types/pengeluaran.type";
import PengeluaranEditForm from "./pengeluaran-edit-form";
import { Form } from "@/components/ui/form";
import { type useForm } from "react-hook-form";

export function PengeluaranEditDrawer({
  isOpen,
  setIsOpen,
  form,
  handleSubmitEditPengeluaran,
  isPending,
  // children,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  form: ReturnType<typeof useForm<ClientPengeluaranFormSchema>>;
  handleSubmitEditPengeluaran: (data: ClientPengeluaranFormSchema) => void;
  isPending: boolean;
  // children?: ReactNode;
}) {
  const isMobile = useIsMobile();

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={isOpen} // Status buka/tutup dikontrol dari luar
      onOpenChange={setIsOpen} // Cara menutup juga dikontrol dari luar
    >
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Detail Pengeluaran</DrawerTitle>
          <DrawerDescription>menampilkan rincian pengeluaran</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <Form {...form}>
            <PengeluaranEditForm onSubmit={handleSubmitEditPengeluaran} />
          </Form>
          {/* {children} */}
        </div>
        <DrawerFooter>
          <Button
            type="submit"
            onClick={form.handleSubmit(handleSubmitEditPengeluaran)}
            disabled={isPending}
          >
            Submit
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
