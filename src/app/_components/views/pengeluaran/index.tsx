"use client";
import type {
  PengeluaranType,
  PengeluaranTypeRouter,
} from "@/types/pengeluaran.type";
import {
  DashboardDescription,
  DashboardHeader,
  DashboardTitle,
} from "../../layouts/dashboard-layout-view";
import { DataTable } from "../../shared/data-table-generic";
import { columns as createColumns } from "./pengeluaran-columns";
import { api } from "@/trpc/react";

interface PengeluaranPageViewProps {
  initialData: PengeluaranTypeRouter[];
}

export default function PengeluaranPageView({
  initialData,
}: PengeluaranPageViewProps) {
  // QUERIES MUTATIONS
  const { data: dataPengeluaran, isLoading: isLoadingPengeluaran } =
    api.pengeluaran.getPengeluaran.useQuery(undefined, {
      initialData: initialData,
    });

  const handleClickEditPengeluaran = () => {
    console.log("Edit");
  };

  const handleClickDeletePengeluaran = () => {
    console.log("Delete");
  };

  const columns = createColumns({
    onEditClick: handleClickEditPengeluaran,
    onDeleteClick: handleClickDeletePengeluaran,
  });

  return (
    <>
      <div className="px-4 lg:px-6">
        <DashboardHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-1">
              <DashboardTitle>Pengeluaran</DashboardTitle>
              <DashboardDescription>
                Lihat, tambah, edit, dan hapus pengeluaran sesuai kebutuhan
                Anda.
              </DashboardDescription>
            </div>
          </div>
        </DashboardHeader>

        <DataTable data={dataPengeluaran} columns={columns} />
      </div>
    </>
  );
}
