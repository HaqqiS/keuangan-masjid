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
import type { PemasukanType } from "@/types/pemasukan.types";
// import DataTableAction from "../../shared/data-table-action-generic";

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

// export const columns: ColumnDef<z.infer<typeof schema>>[] = [
// export const columns: ColumnDef<PemasukanType>[] = [
export const columns = ({
  onEditClick,
}: {
  onEditClick: (item: PemasukanType) => void;
}): ColumnDef<PemasukanType>[] => [
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
  // {
  //   accessorKey: "name",
  //   header: "Name",
  //   cell: ({ row }) => {
  //     return (
  //       <TableCellViewer
  //         item={row.original}
  //         editFormPemasukanOpen={editFormPemasukanOpen}
  //         setEditFormPemasukanOpen={setEditFormPemasukanOpen}
  //       />
  //     );
  //   },
  //   enableHiding: false,
  // },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      // INI SAKLAR PERTAMA
      <Button
        variant="link"
        className="text-foreground w-fit px-0 text-left text-base"
        onClick={() => onEditClick(row.original)}
      >
        {row.original.name}
      </Button>
      // <button
      //   onClick={() => onEditClick(row.original)} // Panggil "perintah" saat di-klik
      //   className="text-foreground variant-link h-auto w-fit p-0 text-left text-base"
      // >
      // </button>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "kategori",
    header: "Kategori",
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="text-muted-foreground px-2 text-sm">
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
    accessorKey: "keterangan",
    header: "Keterangan",

    cell: ({ row }) => {
      return row.original.keterangan;
    },
  },
  {
    accessorKey: "dibuat pada",
    header: "Dibuat pada",

    cell: ({ row }) => {
      return row.original.createdAt;
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
              onClick={() => {
                console.log("Delete Pemasukan ID:", row.original.id);
              }}
            >
              {/* {row.original.id} */}
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
