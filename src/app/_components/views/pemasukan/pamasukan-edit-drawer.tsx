"use client";

import * as React from "react";

import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { type ChartConfig } from "@/components/ui/chart";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import type {
  PemasukanFormSchema,
  PemasukanType,
} from "@/types/pemasukan.types";
import PemasukanForm from "./pemasukan-form";
import { Form } from "@/components/ui/form";

// export const chartData = [
//   { month: "January", desktop: 186, mobile: 80 },
//   { month: "February", desktop: 305, mobile: 200 },
//   { month: "March", desktop: 237, mobile: 120 },
//   { month: "April", desktop: 73, mobile: 190 },
//   { month: "May", desktop: 209, mobile: 130 },
//   { month: "June", desktop: 214, mobile: 140 },
// ];

// export const chartConfig = {
//   desktop: {
//     label: "Desktop",
//     color: "var(--primary)",
//   },
//   mobile: {
//     label: "Mobile",
//     color: "var(--primary)",
//   },
// } satisfies ChartConfig;

// export function PemasukanEditDrawer
// ({ item }: { item: z.infer<typeof schema> }) {
export function PemasukanEditDrawer({
  item,
  isOpen,
  setIsOpen,
}: {
  item: PemasukanType;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();

  // FORM Handlers
  const editPemasukanForm = useForm<PemasukanFormSchema>({
    defaultValues: {
      name: item.name,
      jumlah: item.jumlah,
      keterangan: item.keterangan ?? "",
      kategoriId: item.kategori.id,
    },
  });

  // QUERIES
  const { data: kategoriOptions } = api.kategori.getKategori.useQuery({
    type: "PEMASUKAN",
  });

  // HANDLERS
  const handleSubmitEditPemasukan = () => {
    console.log("Submit Edit Pemasukan");
  };

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={isOpen} // Status buka/tutup dikontrol dari luar
      onOpenChange={setIsOpen} // Cara menutup juga dikontrol dari luar
    >
      {/* <DrawerTrigger asChild>
        <Button
          variant="link"
          className="text-foreground w-fit px-0 text-left text-base"
        >
          {item.name}
        </Button>
      </DrawerTrigger> */}
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Detail Pemasukan</DrawerTitle>
          <DrawerDescription>menampilkan rincian pemasukan</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {!isMobile && (
            <>
              <Separator />
              {/* <div className="grid gap-2">
                <div className="flex gap-2 leading-none font-medium">
                  Trending up by 5.2% this month{" "}
                  <IconTrendingUp className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Showing total visitors for the last 6 months. This is just
                  some random text to test the layout. It spans multiple lines
                  and should wrap around.
                </div>
              </div> */}
              {/* <Separator /> */}
            </>
          )}
          <Form {...editPemasukanForm}>
            <PemasukanForm onSubmit={handleSubmitEditPemasukan} />
          </Form>
        </div>
        <DrawerFooter>
          <Button>Submit</Button>
          <DrawerClose asChild>
            <Button variant="outline">Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
