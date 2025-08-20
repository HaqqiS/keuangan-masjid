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
import type { PengajuanFormSchema } from "@/types/pengajuan.type";
import { Form } from "@/components/ui/form";
import { type useForm } from "react-hook-form";
import PengajuanForm from "./pengajuan-form";

export function PengajuanEditDrawer({
  isOpen,
  setIsOpen,
  form,
  handleSubmitEditPengajuan,
  isPending,
  // children,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  form: ReturnType<typeof useForm<PengajuanFormSchema>>;
  handleSubmitEditPengajuan: (data: PengajuanFormSchema) => void;
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
          <DrawerTitle>Detail Pengajuan</DrawerTitle>
          <DrawerDescription>menampilkan rincian pengajuan</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <Form {...form}>
            <PengajuanForm onSubmit={handleSubmitEditPengajuan} />
          </Form>
          {/* {children} */}
        </div>
        <DrawerFooter>
          <Button
            type="submit"
            onClick={form.handleSubmit(handleSubmitEditPengajuan)}
            disabled={isPending}
          >
            Submit
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
