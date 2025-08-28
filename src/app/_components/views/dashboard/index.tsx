"use client";
import { columns as createColumns } from "@/app/_components/views/dashboard/dashboard-column";
import { DataTable } from "../../shared/data-table-generic";
import { api } from "@/trpc/react";
import type { PengajuanTypeRouter } from "@/types/pengajuan.type";
import { useSession } from "next-auth/react";

interface DashboardPageViewProps {
  initialData: PengajuanTypeRouter[];
}

export default function DashboardPageView({
  initialData,
}: DashboardPageViewProps) {
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

  const { data: dataPengajuan } = api.pengajuan.getPengajuan.useQuery(
    undefined,
    { initialData },
  );

  return (
    <>
      <DataTable data={dataPengajuan} columns={columns} />
    </>
  );
}
