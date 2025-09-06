// import { ChartAreaInteractive } from "@/app/_components/views/chart-area-interactive";
import { SectionCards } from "@/app/_components/views/dashboard/section-cards";
import DashboardPageView from "../_components/views/dashboard";
import { api } from "@/trpc/server";
// import data from "./data.json";
// import { DataTable } from "../_components/shared/data-table-generic";

export default async function DashboardPage() {
  const dataPengajuan = await api.dashboard.getPengajuan();

  return (
    <>
      <SectionCards />
      <div className="px-4 lg:px-6">{/* <ChartAreaInteractive /> */}</div>
      {/* <DataTable data={data} columns={columns} /> */}
      <DashboardPageView initialData={dataPengajuan} />
    </>
  );
}
