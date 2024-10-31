import { DashboardConfig } from "@/types";

export const dashboardConfig: DashboardConfig = {
  mainNav: [
    {
      title: "Documentation",
      href: "/docs",
    },
    {
      title: "Support",
      href: "/support",
      disabled: true,
    },
  ],
  sidebarNav: [
    {
      title: "Test Suits",
      href: "/dashboard/test-suites",
      icon: "test",
    },
    // {
    //   title: "Datasources",
    //   href: "/dashboard/data-sources",
    //   icon: "billing",
    // },
    {
      title: "Help Desk",
      href: "#",
      icon: "headset",
    },
    {
      title: "Users",
      href: "#",
      icon: "users",
    },
    {
      title: "Surveys",
      href: "#",
      icon: "feedback",
    },
    {
      title: "Billing",
      href: "#",
      icon: "billing",
    },
  ],
};
