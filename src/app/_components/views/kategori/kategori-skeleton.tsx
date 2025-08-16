import { Skeleton } from "@/components/ui/skeleton";
import {
  DashboardDescription,
  DashboardHeader,
  DashboardTitle,
} from "@/app/_components/layouts/dashboard-layout-view";

export function KategoriSkeleton() {
  return (
    <div className="px-4 lg:px-6">
      <DashboardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <DashboardTitle>Kategori</DashboardTitle>
            <DashboardDescription>
              Lihat, tambah, edit, dan hapus kategori sesuai kebutuhan Anda.
            </DashboardDescription>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </DashboardHeader>

      <div className="space-y-4">
        <div className="flex items-center space-x-2 px-4">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-10 w-48" />
        </div>

        <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
