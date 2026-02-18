"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

export function FloatingNav() {
    const pathname = usePathname();

    return (
        <nav className="floating-nav">
            <div className="flex items-center gap-8 px-6 py-2.5">
                {/* Brand */}
                <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
                    <div className="flex h-7 w-7 items-center justify-center bg-saffron text-black transition-transform group-hover:scale-105">
                        <IndianRupee className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </div>
                    <span className="font-display text-sm font-bold tracking-tight text-foreground">
                        Kaasu
                    </span>
                </Link>

                {/* Divider */}
                <div className="w-px h-4 bg-border" />

                {/* Nav Items */}
                <div className="flex items-center gap-1">
                    {navItems.map((item) => {
                        const isActive =
                            item.href === "/"
                                ? pathname === "/"
                                : pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.title}
                                href={item.href}
                                className={`
                  nav-item flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium transition-all duration-150
                  ${isActive
                                        ? "bg-saffron/10 text-saffron border border-saffron/25"
                                        : "text-muted-foreground hover:text-foreground border border-transparent hover:border-border/50"
                                    }
                `}
                            >
                                <item.icon className="h-3.5 w-3.5" />
                                <span>{item.title}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
