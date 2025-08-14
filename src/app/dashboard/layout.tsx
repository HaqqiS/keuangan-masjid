import type { ReactNode } from "react";
import DashboardLayoutView from "../_components/layouts/dashboard-layout-view";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardLayoutView>{children}</DashboardLayoutView>;
}
