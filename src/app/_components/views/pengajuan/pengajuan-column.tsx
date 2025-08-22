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
import type { PengajuanTypeRouter } from "@/types/pengajuan.type";
import { dateFormatter } from "@/utils/dateFormatter";
import { StatusPengajuan, UserRole } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
  onStatusChange,
  isPendingStatusChange,
  role,
}: {
  onEditClick: (item: PengajuanTypeRouter) => void;
  onDeleteClick: (pengajuanId: string, pengajuanJudul: string) => void;
  onStatusChange: (pengajuanId: string, status: StatusPengajuan) => void;
  isPendingStatusChange: boolean;
  role: UserRole | undefined;
}): ColumnDef<PengajuanTypeRouter>[] => [
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
    accessorKey: "judul",
    header: "Judul Pengajuan",
    cell: ({ row }) => (
      <Button
        variant="link"
        className="text-foreground w-fit px-0 text-left text-base"
        onClick={() => onEditClick(row.original)}
      >
        {row.original.judul}
      </Button>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "kategori",
    header: "Kategori",
    cell: ({ row }) => {
      return (
        <div className="w-24 lg:w-32">
          <Badge
            variant="outline"
            className="text-muted-foreground h-auto px-2 text-center text-sm break-words whitespace-normal lg:truncate lg:whitespace-nowrap"
          >
            {row.original.kategori.name}
          </Badge>
        </div>
      );
    },
  },

  {
    accessorKey: "jumlah",
    header: () => <div className="w-full text-center">Jumlah</div>,
    cell: ({ row }) => (
      <div className="text-center">{toRupiah(row.original.jumlah)}</div>
    ),
  },
  {
    accessorKey: "diajukan oleh",
    header: "Diajukan oleh",
    cell: ({ row }) => {
      return row.original.diajukanOleh.name;
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
    cell: ({ row }) => {
      const isPending = row.original.status === StatusPengajuan.PENDING;

      if (role === (UserRole.KETUA || UserRole.BENDAHARA)) {
        if (!isPending) {
          return (
            <div className="w-32">
              <Badge
                variant="outline"
                className={`px-2 text-sm ${
                  row.original.status === StatusPengajuan.REJECTED
                    ? "border-red-200 bg-red-100 text-red-700"
                    : row.original.status === StatusPengajuan.APPROVED
                      ? "border-green-200 bg-green-100 text-green-700"
                      : "text-muted-foreground"
                }`}
              >
                {row.original.status}
              </Badge>
            </div>
          );
        }
        return (
          <>
            <Label htmlFor={`${row.original.id}-reviewer`} className="sr-only">
              Reviewer
            </Label>
            <Select
              defaultValue={row.original.status}
              disabled={isPendingStatusChange}
              onValueChange={(value) => {
                onStatusChange(row.original.id, value as StatusPengajuan);
              }}
            >
              <SelectTrigger
                className="w-38 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
                size="sm"
                id={`${row.original.id}-reviewer`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem
                  value={StatusPengajuan.APPROVED}
                  className="!bg-green-100 !text-green-700 data-[state=checked]:!bg-green-200"
                >
                  {StatusPengajuan.APPROVED}
                </SelectItem>
                <SelectItem value={StatusPengajuan.PENDING}>
                  {StatusPengajuan.PENDING}
                </SelectItem>
                <SelectItem
                  value={StatusPengajuan.REJECTED}
                  className="!bg-red-100 !text-red-700 data-[state=checked]:!bg-red-200"
                >
                  {StatusPengajuan.REJECTED}
                </SelectItem>
              </SelectContent>
            </Select>
          </>
        );
      } else {
        return (
          <div className="w-32">
            <Badge
              variant="outline"
              className={`px-2 text-sm ${
                row.original.status === StatusPengajuan.REJECTED
                  ? "border-red-200 bg-red-100 text-red-700"
                  : row.original.status === StatusPengajuan.APPROVED
                    ? "border-green-200 bg-green-100 text-green-700"
                    : "text-muted-foreground"
              }`}
            >
              {row.original.status}
            </Badge>
          </div>
        );
      }
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
              onClick={() => onDeleteClick(row.original.id, row.original.judul)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
