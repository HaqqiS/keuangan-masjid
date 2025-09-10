"use client";

import * as React from "react";
import { IconBuildingMosque } from "@tabler/icons-react";
// import { NavDocuments } from "@/app/_components/shared/nav-documents";
import { NavMain } from "@/app/_components/shared/nav-main";
// import { NavSecondary } from "@/app/_components/shared/nav-secondary";
import { NavUser } from "@/app/_components/shared/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";
import { navMain } from "@/constants/nav-menu.constant";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const session = useSession();
  const user = session.data?.user;

  const filteredNavMain = React.useMemo(() => {
    if (!user) return [];

    return navMain.filter((item) => item.roles.includes(user.role));
  }, [user]);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <IconBuildingMosque className="!size-5" />
                <span className="text-base font-semibold">Masjid.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
        {/* <NavDocuments items={data.documents} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          // id={user?.id ?? ""}
          name={user?.name ?? ""}
          email={user?.email ?? ""}
          role={user?.role ?? UserRole.PENGURUS}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
