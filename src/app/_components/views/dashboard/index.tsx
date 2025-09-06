"use client";
import { columns as createColumns } from "@/app/_components/views/dashboard/dashboard-column";
import { DataTable } from "../../shared/data-table-generic";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import type { RouterOutputs } from "@/types";
import { useState } from "react";
import type { PaginationState } from "@tanstack/react-table";

interface DashboardPageViewProps {
  initialData: RouterOutputs["dashboard"]["getPengajuan"];
}

export default function DashboardPageView({
  initialData,
}: DashboardPageViewProps) {
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0, // Halaman awal
    pageSize: 10, // Default item per halaman
  });

  const session = useSession();
  const userRole = session.data?.user.role;

  const columns = createColumns({
    // onEditClick: handleClickEditPengajuan,
    // onDeleteClick: handleClickDeletePengajuan,
    // onStatusChange: handleStatusChange,
    // isPendingStatusChange: isPendingUpdateStatus,
    onEditClick: () => ({}),
    onDeleteClick: () => ({}),
    onStatusChange: () => ({}),
    isPendingStatusChange: false,

    role: userRole,
  });

  const { data: dataPengajuan } = api.dashboard.getPengajuan.useQuery(
    undefined,
    { initialData: initialData },
  );
  const pageCount = 1;

  return (
    <>
      <DataTable
        data={dataPengajuan}
        columns={columns}
        onPaginationChange={setPagination}
        pageCount={pageCount}
        pagination={{ pageIndex, pageSize }}
      />
    </>
  );
}
