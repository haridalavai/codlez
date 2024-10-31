"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/auth";
import { SidebarNavItem } from "@/types";
import { cn } from "@repo/ui/lib/utils";
import { Icons } from "@repo/ui/components/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { TooltipProvider } from "@repo/ui/components/ui/tooltip";
import { Button } from "@repo/ui/components/ui/button";
import { GetServerSidePropsContext } from "next";
import { UserButton } from "@clerk/nextjs";
import { UserAccountNav } from "./user-account-nav";

interface DashboardNavProps {
  items: SidebarNavItem[];
}

const DashboardNav = ({ items }: DashboardNavProps) => {
  const path = usePathname();
  const router = useRouter();

  if (!items?.length) {
    return null;
  }

  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <div className="p-2 border-b">
          <Button
            variant="outline"
            size="icon"
            aria-label="Home"
            onClick={() => {
              router.push("/dashboard");
            }}
            className={cn(path === "/dashboard" ? "bg-accent" : "transparent")}
          >
            <Icons.logo className="size-5 fill-foreground" />
          </Button>
        </div>

        <nav className="grid gap-1 p-2">
          {items.map((item, index) => {
            const Icon = Icons[item.icon || "arrowRight"];
            return (
              item.href && (
                <Tooltip key={index}>
                  <TooltipTrigger>
                    <Link key={index} href={item.disabled ? "/" : item.href}>
                      <span
                        className={cn(
                          "group flex items-center justify-center rounded-md p-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                          path === item.href ? "bg-accent" : "transparent",
                          item.disabled && "cursor-not-allowed opacity-80"
                        )}
                      >
                        <Icon className="w-4 h-4" />

                        {/* <span>{item.title}</span> */}
                      </span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.title}</TooltipContent>
                </Tooltip>
              )
            );
          })}
        </nav>
      </div>
      <nav className="grid gap-1 p-2 mt-auto">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="mt-auto rounded-full"
              aria-label="Help"
            >
              {/* <UserAccountNav /> */}
              <UserButton />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={5}>
            Account
          </TooltipContent>
        </Tooltip>
      </nav>
    </div>
  );
};

export default DashboardNav;
