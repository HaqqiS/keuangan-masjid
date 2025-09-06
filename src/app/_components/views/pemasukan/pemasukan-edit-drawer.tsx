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
import type { ClientPemasukanFormSchema } from "@/types/pemasukan.types";
import PemasukanForm from "./pemasukan-form";
import { Form } from "@/components/ui/form";
import { type useForm } from "react-hook-form";

// export function PemasukanEditDrawer
// ({ item }: { item: z.infer<typeof schema> }) {
export function PemasukanEditDrawer({
  isOpen,
  setIsOpen,
  form,
  handleSubmitEditPemasukan,
  isPending,
  // children,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  form: ReturnType<typeof useForm<ClientPemasukanFormSchema>>;
  handleSubmitEditPemasukan: (data: ClientPemasukanFormSchema) => void;
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
          <DrawerTitle>Detail Pemasukan</DrawerTitle>
          <DrawerDescription>menampilkan rincian pemasukan</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <Form {...form}>
            <PemasukanForm onSubmit={handleSubmitEditPemasukan} />
          </Form>
          {/* {children} */}
        </div>
        <DrawerFooter>
          <Button
            type="submit"
            onClick={form.handleSubmit(handleSubmitEditPemasukan)}
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
