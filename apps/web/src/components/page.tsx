import { Link, useMatchRoute, useRouterState } from "@tanstack/react-router";
import {
  AppWindowIcon,
  ChevronRightIcon,
  ListTodo,
  MessageSquare,
  SettingsIcon
} from "lucide-react";
import * as React from "react";

import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { BottomNav } from "@/components/layout/BottomNav";

type NavItem = {
  label: "Chat" | "Tasks" | "Settings";
  to: "/chat" | "/tasks" | "/settings";
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const navItems: NavItem[] = [
  { label: "Tasks", to: "/tasks", Icon: ListTodo },
  { label: "Chat", to: "/chat", Icon: MessageSquare },
  { label: "Settings", to: "/settings", Icon: SettingsIcon },
];

export function Page({ children }: { children: React.ReactNode }) {
  const matchRoute = useMatchRoute();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const activeNav = React.useMemo(() => {
    return navItems.find((item) => pathname.startsWith(item.to));
  }, [pathname]);

  return (
    <SidebarProvider
      defaultOpen={false}
      style={
        {
          // Slightly slimmer than the default 16rem, matches the reference better
          // "--sidebar-width": "14rem",
          // "--sidebar-width-icon": "3rem",
        } as React.CSSProperties
      }
    >
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="default"
                tooltip="ToManage"
                render={<Link to="/chat" />}
                className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
              >
                <AppWindowIcon className="size-4" />
                <span className="font-semibold group-data-[collapsible=icon]:hidden">
                  ToManage
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => {
              const isActive = Boolean(
                matchRoute({ to: item.to, fuzzy: false })
              );

              return (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    isActive={isActive}
                    tooltip={item.label}
                    render={<Link to={item.to} />}
                    size="default"
                    // className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
                  >
                    <item.Icon />
                    <span>
                      {item.label}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarRail />
      </Sidebar>

      <SidebarInset className="bg-background">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="md:flex hidden" />
          <Separator orientation="vertical" className="mx-1 h-4 md:block hidden" />
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <span className="hidden md:inline">ToManage</span>
            <ChevronRightIcon className="size-4 hidden md:inline" />
            <span className="text-foreground font-medium">
              {activeNav?.label ?? "Home"}
            </span>
          </nav>
        </header>
        <main className="flex flex-1 flex-col p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </SidebarInset>

      <BottomNav />
    </SidebarProvider>
  );
}
