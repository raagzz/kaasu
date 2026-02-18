"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarHeader,
    SidebarFooter,
} from "@/components/ui/sidebar";
import {
    IndianRupee,
    LayoutGrid,
    FolderOpen,
    Tags,
    BarChart3,
} from "lucide-react";

const navItems = [
    { title: "Expenses", href: "/", icon: LayoutGrid },
    { title: "Categories", href: "/categories", icon: FolderOpen },
    { title: "Tags", href: "/tags", icon: Tags },
    { title: "Summary", href: "/summary", icon: BarChart3 },
];

export function AppSidebar() {
    const pathname = usePathname();

    return (
        <Sidebar className="border-r border-sidebar-border">
            <SidebarHeader className="p-5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center bg-saffron text-black">
                        <IndianRupee className="h-4.5 w-4.5" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="font-display text-sm font-bold tracking-tight text-sidebar-accent-foreground">
                            Kaasu
                        </h2>
                        <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
                            Expense Tracker
                        </p>
                    </div>
                </div>
                <div className="geo-line mt-4" />
            </SidebarHeader>
            <SidebarContent className="px-2">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-0.5">
                            {navItems.map((item) => {
                                const isActive =
                                    item.href === "/"
                                        ? pathname === "/"
                                        : pathname.startsWith(item.href);
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            className={`
                        h-9 text-[13px] font-medium transition-all duration-150
                        ${isActive
                                                    ? "bg-saffron/10 text-saffron border-l-2 border-saffron"
                                                    : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent border-l-2 border-transparent"
                                                }
                      `}
                                        >
                                            <Link href={item.href}>
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-4">
                <div className="geo-line mb-3" />
                <p className="text-[10px] tracking-[0.08em] text-muted-foreground/60 uppercase">
                    All amounts in ₹ INR
                </p>
            </SidebarFooter>
        </Sidebar>
    );
}
