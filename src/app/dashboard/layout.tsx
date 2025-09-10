import type { ReactNode } from "react";
import DashboardLayoutView from "../_components/layouts/dashboard-layout-view";
import CreatePengajuan from "../_components/shared/create-pengajuan";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayoutView>
      {children}

      <CreatePengajuan />
    </DashboardLayoutView>
  );
}
