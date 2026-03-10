"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  Settings,
  LogOut,
  ChevronRight,
  UserCircle,
  CheckCircle2,
  CreditCard,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  session: any;
}

export function AppSidebar({ session, ...props }: AppSidebarProps) {
  const pathname = usePathname();

  const menuGroups = [
    {
      label: "Genel",
      items: [
        {
          title: "Panel",
          href: `/dashboard`,
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: "Şirket Yönetimi",
      hide: !(
        session?.user?.role === "COMPANY_ADMIN" ||
        session?.user?.role === "SUPER_ADMIN" ||
        session?.user?.role === "MANAGER" ||
        session?.user?.departmentName === "İK" ||
        session?.user?.departmentName === "İnsan Kaynakları"
      ),
      items: [
        {
          title: "Çalışanlar",
          href: `/dashboard/employees`,
          icon: Users,
        },
        {
          title: "Departmanlar",
          href: `/dashboard/departments`,
          icon: Building2,
        },
        {
          title: "Bordrolar",
          href: `/dashboard/payroll`,
          icon: CreditCard,
        },
      ],
    },
    {
      label: "Taleplerim",
      items: [
        {
          title: "İzin Taleplerim",
          href: `/dashboard/leaves`,
          icon: CalendarDays,
        },
        {
          title: "Düzeltme Taleplerim",
          href: `/dashboard/attendance`,
          icon: UserCircle,
        },
      ],
    },
    {
      label: "Onay İşlemleri",
      hide: !(session?.user?.role === 'COMPANY_ADMIN' || session?.user?.role === 'MANAGER' || session?.user?.departmentName === "İK" || session?.user?.departmentName === "İnsan Kaynakları"),
      items: [
        ...(session?.user?.departmentName === "İK" ||
          session?.user?.departmentName === "İnsan Kaynakları" ||
          session?.user?.role === "COMPANY_ADMIN"
          ? [
            {
              title: "İK Onayları",
              href: `/dashboard/hr/approvals`,
              icon: CheckCircle2,
            },
          ]
          : []),
        ...(session?.user?.role === "COMPANY_ADMIN" ||
          session?.user?.role === "MANAGER" ||
          session?.user?.departmentName === "İK" ||
          session?.user?.departmentName === "İnsan Kaynakları"
          ? [
            {
              title: "İzin Onayları",
              href: `/dashboard/hr/leave-requests`,
              icon: CheckCircle2,
            },
            {
              title: "Düzeltme Onayları",
              href: `/dashboard/hr/attendance-requests`,
              icon: CheckCircle2,
            },
          ]
          : []),
      ],
    },
    {
      label: "Sistem",
      items: [
        {
          title: "Ayarlar",
          href: `/dashboard/settings`,
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      {...props}
      className="border-r border-border/50"
    >
      <SidebarHeader>
        <div className="flex items-center gap-3">
          <div className="flex aspect-square size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Building2 className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-sm truncate">Zor IK</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-tight font-medium">
              Birim Yönetimi
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2">
        {menuGroups.map((group, idx) => {
          if (group.hide || group.items.length === 0) return null;
          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 px-3 mb-1">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        tooltip={item.title}
                        className={cn(
                          "h-9 px-3 transition-all duration-200 hover:bg-accent/50",
                          pathname === item.href &&
                          "bg-primary/5 text-primary hover:bg-primary/10",
                        )}
                      >
                        <Link href={item.href} className="flex items-center gap-3">
                          <item.icon
                            className={cn(
                              "size-4 shrink-0",
                              pathname === item.href
                                ? "text-primary"
                                : "text-muted-foreground",
                            )}
                          />
                          <span className="text-sm font-medium">{item.title}</span>
                          {pathname === item.href && (
                            <div className="ml-auto size-1.5 rounded-full bg-primary group-data-[collapsible=icon]:hidden" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-border/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-accent data-[state=open]:text-accent-foreground h-12 px-2"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted">
                    <UserCircle className="size-5 text-muted-foreground" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden ml-2">
                    <span className="truncate font-semibold">
                      {session?.user?.name || "Kullanıcı"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {session?.user?.email}
                    </span>
                  </div>
                  <ChevronRight className="ml-auto size-4 group-data-[collapsible=icon]:hidden text-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link
                    href={`/dashboard/settings`}
                    className="flex items-center gap-2 cursor-pointer w-full"
                  >
                    <Settings className="size-4" />
                    <span>Ayarlar</span>
                  </Link>
                </DropdownMenuItem>
                <SidebarSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                  onClick={() => signOut({ callbackUrl: `/login` })}
                >
                  <LogOut className="size-4 mr-2" />
                  Çıkış Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
