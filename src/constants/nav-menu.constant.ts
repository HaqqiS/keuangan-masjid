import { UserRole } from "@prisma/client";
import {
  IconCategory2,
  IconDashboard,
  IconFile,
  IconTransferIn,
  IconTransferOut,
} from "@tabler/icons-react";

export const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IconDashboard,
    roles: [UserRole.KETUA, UserRole.BENDAHARA],
  },
  {
    title: "Pemasukan",
    url: "/dashboard/pemasukan",
    icon: IconTransferIn,
    roles: [UserRole.KETUA, UserRole.BENDAHARA],
  },
  {
    title: "Pengeluaran",
    url: "/dashboard/pengeluaran",
    icon: IconTransferOut,
    roles: [UserRole.KETUA, UserRole.BENDAHARA],
  },
  {
    title: "Pengajuan",
    url: "/dashboard/pengajuan",
    icon: IconFile,
    roles: [UserRole.KETUA, UserRole.BENDAHARA, UserRole.PENGURUS],
  },
  {
    title: "Kategori",
    url: "/dashboard/kategori",
    icon: IconCategory2,
    roles: [UserRole.KETUA, UserRole.BENDAHARA, UserRole.PENGURUS],
  },
];
