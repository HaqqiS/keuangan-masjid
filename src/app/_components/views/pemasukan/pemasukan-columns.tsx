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
import { dateFormatter } from "@/utils/dateFormatter";

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
  onDeleteClick,
}: {
  onEditClick: (item: PemasukanType) => void;
  onDeleteClick: (pemasukanId: string, pemasukanName: string) => void;
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
      console.log("Created At:", row.original.createdAt);
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
