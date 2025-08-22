"use client";
import {
  IconCheck,
  IconFileTime,
  IconTrendingDown,
  IconTrendingUp,
  IconX,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";
import { toRupiah } from "@/utils/toRupiah";
import { Coins, ShoppingCart } from "lucide-react";

export function SectionCards() {
  const { data: dashboardStats, isLoading: isLoadingDashboardStats } =
    api.dashboard.getDashboardStats.useQuery();

  const {
    saldoAkhir,
    pengeluaranBulanIni,
    saldo,
    pengajuan,
    pemasukan,
    pengeluaran,
  } = dashboardStats ?? {};

  // Komponen kecil untuk menampilkan persentase
  const ChangeBadge = ({ value }: { value: number }) => {
    const isPositive = value >= 0;
    return (
      <>
        {isPositive ? (
          <>
            <IconTrendingUp className="h-4 w-4" /> +
          </>
        ) : (
          <>
            <IconTrendingDown className="h-4 w-4" /> -
          </>
        )}
        {Math.abs(value)}%
      </>
    );
  };
  if (isLoadingDashboardStats) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Skeleton className="h-45.5" />
        <Skeleton className="h-45.5" />
        <Skeleton className="h-45.5" />
        <Skeleton className="h-45.5" />
      </div>
    );
  }
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Saldo</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {/* $1,250.00 */}
            {toRupiah(saldoAkhir ?? 0)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {saldo?.saldoChange !== undefined && (
                <ChangeBadge value={saldo.saldoChange} />
              )}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {saldo && ( // Tampilkan footer hanya jika data sudah ada
            <>
              <p className="line-clamp-1 flex gap-2 font-medium">
                {saldo.netIncomeBulanIni >= 0 ? (
                  <IconTrendingUp className="mr-2 h-4 w-4 text-green-500" />
                ) : (
                  <IconTrendingDown className="mr-2 h-4 w-4 text-red-500" />
                )}
                {saldo?.netIncomeBulanIni >= 0 ? "Surplus" : "Defisit"} sebesar{" "}
                {toRupiah(Math.abs(saldo?.netIncomeBulanIni))} bulan ini.
              </p>
              <p className="text-muted-foreground">
                {saldo.perbedaanNetIncome >= 0 ? "Naik " : "Turun "}
                {toRupiah(Math.abs(saldo.perbedaanNetIncome))} dari bulan lalu.
              </p>
            </>
          )}
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Pengajuan Bulan Ini</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {pengajuan?.totalPengajuanBulanIni ?? 0}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {saldo?.saldoChange !== undefined && (
                <ChangeBadge value={saldo.saldoChange} />
              )}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {/* <div className="text-muted-foreground mt-4 space-y-1 text-sm"> */}
          {pengajuan && ( // Tampilkan footer hanya jika data sudah ada
            <>
              {/* Baris 1: Rincian Status */}
              <div className="line-clamp-1 flex items-center gap-2 space-x-2 font-medium">
                <span className="flex items-center text-green-500">
                  <IconCheck className="mr-1 h-3 w-3" />
                  {pengajuan.statusCounts.APPROVED} Disetujui
                </span>
                <span className="flex items-center text-red-500">
                  <IconX className="mr-1 h-3 w-3" />
                  {pengajuan.statusCounts.REJECTED} Ditolak
                </span>
                {/* <span className="flex items-center text-amber-500">
                  <IconX className="mr-1 h-3 w-3" />
                  {pengajuan.statusCounts.PENDING} Pending
                </span> */}
              </div>

              {/* Baris 2: Ajakan Bertindak (jika ada yg PENDING) */}
              {pengajuan.statusCounts.PENDING > 0 && (
                <p className="line-clamp-1 flex items-center gap-2 font-medium text-amber-500">
                  <IconFileTime className="mr-1 h-3 w-3" />
                  {pengajuan.statusCounts.PENDING} pengajuan butuh tinjauan
                  Anda.
                </p>
              )}
            </>
          )}
          {/* </div> */}
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Pemasukan Bulan Ini</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {toRupiah(pemasukan?.pemasukanBulanIni ?? 0)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {pemasukan?.pemasukanChange !== undefined && (
                <ChangeBadge value={pemasukan.pemasukanChange} />
              )}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {/* <div className="text-muted-foreground mt-4 space-y-1 text-sm"> */}
          {pemasukan?.topCategoryInfo ? (
            <>
              <p className="line-clamp-1 flex items-center gap-2 font-medium">
                <Coins className="mr-2 h-4 w-4" />
                Sumber terbesar dari {pemasukan?.topCategoryInfo.name}
              </p>
              <p>
                Menyumbang {toRupiah(pemasukan?.topCategoryInfo.amount)} dari
                total.
              </p>
            </>
          ) : (
            <p>Belum ada pemasukan bulan ini.</p>
          )}
          {/* </div> */}
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Pengeluaran Bulan Ini</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {toRupiah(pengeluaran?.pengeluaranBulanIni ?? 0)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {pengeluaran?.pengeluaranChange !== undefined && (
                <ChangeBadge value={pengeluaran.pengeluaranChange} />
              )}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {pengeluaran?.topPengeluaranCategoryInfo ? (
            <>
              <p className="flex items-center">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Pengeluaran terbesar untuk{" "}
                {pengeluaran.topPengeluaranCategoryInfo.name}
              </p>
              <p>
                Sebesar{" "}
                {toRupiah(pengeluaran.topPengeluaranCategoryInfo.amount)} dari
                total.
              </p>
            </>
          ) : (
            <p>Belum ada pengeluaran bulan ini.</p>
          )}
          {/* <div className="line-clamp-1 flex gap-2 font-medium">
            Steady performance increase <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Meets growth projections</div> */}
        </CardFooter>
      </Card>
    </div>
  );
}
