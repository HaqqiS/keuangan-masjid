import { Skeleton } from "@/components/ui/skeleton";
import {
  DashboardDescription,
  DashboardHeader,
  DashboardTitle,
} from "@/app/_components/layouts/dashboard-layout-view";

export default function PemasukanSkeleton() {
  return (
    <div className="px-4 lg:px-6">
      <DashboardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <DashboardTitle>Pemasukan</DashboardTitle>
            <DashboardDescription>
              Lihat, tambah, edit, dan hapus pemasukan sesuai kebutuhan Anda.
            </DashboardDescription>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </DashboardHeader>

      {/* Skeleton untuk meniru DataTable */}
      <div className="mt-4 rounded-md border">
        <div className="w-full p-4">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="w-full p-4 pt-0">
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  );
}
