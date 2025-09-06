"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { IconDotsVertical, IconGripVertical } from "@tabler/icons-react";
import { type ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toRupiah } from "@/utils/toRupiah";
import type { PengeluaranTypeRouter } from "@/types/pengeluaran.type";
import { dateFormatter } from "@/utils/dateFormatter";
import Image from "next/image";

// Create a separate component for the drag handle
function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({
    id,
  });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

export const columns = ({
  onEditClick,
  onDeleteClick,
}: {
  onEditClick: (item: PengeluaranTypeRouter) => void;
  onDeleteClick: (pengeluaranId: string, pengeluaranName: string) => void;
}): ColumnDef<PengeluaranTypeRouter>[] => [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    id: "number",
    header: () => (
      <div className="text-muted-foreground w-full text-center">No</div>
    ),

    cell: ({ row }) => {
      return (
        <div className="text-muted-foreground text-center">{row.index + 1}</div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name Pengeluaran",
    cell: ({ row }) => (
      <Button
        variant="link"
        className="text-foreground w-fit px-0 text-left text-base"
        onClick={() => onEditClick(row.original)}
      >
        {row.original.name}
      </Button>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "kategori",
    header: "Kategori",
    cell: ({ row }) => (
      <div className="w-24 lg:w-32">
        <Badge
          variant="outline"
          className="text-muted-foreground h-auto px-2 text-center text-sm break-words whitespace-normal lg:truncate lg:whitespace-nowrap"
        >
          {row.original.kategori.name}
        </Badge>
      </div>
    ),
  },

  {
    accessorKey: "jumlah",
    header: () => <div className="w-full text-center">Jumlah</div>,
    cell: ({ row }) => (
      <div className="text-center">{toRupiah(row.original.jumlah)}</div>
    ),
  },
  {
    accessorKey: "dibuat oleh",
    header: "Dibuat oleh",
    cell: ({ row }) => {
      return row.original.createdBy.name;
    },
  },
  {
    accessorKey: "transaksiImageUrl",
    header: "Bukti Transaksi",
    cell: ({ row }) => {
      return row.original.transaksiImageUrl ? (
        <Image
          src={row.original.transaksiImageUrl}
          alt="Bukti Transaksi"
          width={50}
          height={50}
          className="rounded-md"
        />
      ) : (
        <div className="text-muted-foreground">Tidak ada bukti</div>
      );
    },
  },
  {
    accessorKey: "keterangan",
    header: "Keterangan",

    cell: ({ row }) => {
      return row.original.keterangan;
    },
  },
  {
    accessorKey: "status",
    header: "Status Pengajuan",
    cell: ({ row }) => (
      <>
        {row.original.pengajuan?.status ?? (
          <span className="text-muted-foreground">Tidak ada</span>
        )}
      </>
    ),
  },
  {
    accessorKey: "pengajuan",
    header: "Diajukan Oleh",
    cell: ({ row }) => {
      return (
        row.original.pengajuan?.diajukanOleh.name ?? (
          <span className="text-muted-foreground">Tidak ada</span>
        )
      );
    },
  },
  {
    accessorKey: "dibuat pada",
    header: "Dibuat pada",

    cell: ({ row }) => {
      const formattedDate = dateFormatter(row.original.createdAt);
      return formattedDate;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon"
            >
              <IconDotsVertical />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem
              onClick={() => onEditClick(row.original)} // Panggil "perintah" saat di-klik
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDeleteClick(row.original.id, row.original.name)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
