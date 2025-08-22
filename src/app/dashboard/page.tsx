import { ChartAreaInteractive } from "@/app/_components/views/chart-area-interactive";
import { SectionCards } from "@/app/_components/views/dashboard/section-cards";
import data from "./data.json";
import { DataTable } from "../_components/views/data-table";

export default function DashboardPage() {
  return (
    <>
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </>
  );
}
