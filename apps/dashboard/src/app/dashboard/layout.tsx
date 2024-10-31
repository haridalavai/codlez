"use client";
import { notFound, redirect, usePathname } from "next/navigation";

import { dashboardConfig } from "@/config/dashboard";
import { MainNav } from "@/components/main-nav";
import DashboardNav from "@/components/nav";
import { OrganizationSwitcher, ClerkLoading } from "@clerk/nextjs";
import { Button } from "@repo/ui/components/ui/button";
import { Icons } from "@repo/ui/components/icons";
import { auth, getAuth } from "@clerk/nextjs/server";
import { useEffect } from "react";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathName = usePathname();
  return (
    <div className="flex flex-col min-h-screen">
      {/* <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex items-center justify-between h-16 py-4">
          <MainNav items={dashboardConfig.mainNav} />
         
        </div>
      </header> */}
      <div className="flex flex-1 ">
        <aside className="flex-col hidden border-r w-fit md:flex bg-background">
          <DashboardNav items={dashboardConfig.sidebarNav} />
        </aside>
        <main className="flex flex-col flex-1 w-full overflow-hidden h-screen">
          <div className="flex border border-t-0 border-l-0 border-r-0 items-center justify-between p-2 px-10">
            {/* <Button variant="outline" size="icon" aria-label="Home">
              <Icons.logo className="size-5 fill-foreground" />
            </Button> */}
            <OrganizationSwitcher />
          </div>
          <div className=" h-full">{children}</div>
        </main>
      </div>
      {/* <SiteFooter className="border-t" /> */}
    </div>
  );
}
