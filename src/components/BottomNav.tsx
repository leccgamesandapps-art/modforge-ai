"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, FolderKanban } from "lucide-react";
import clsx from "clsx";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/create", label: "Create", icon: Sparkles },
  { href: "/projects", label: "Projects", icon: FolderKanban },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-[#0d1410]/95 backdrop-blur-lg border-t border-border flex items-center justify-around px-2 safe-area-pb">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={clsx(
              "nav-item flex-1 max-w-[120px]",
              active && "active"
            )}
          >
            <Icon className={clsx("w-6 h-6", active && "text-primary")} strokeWidth={active ? 2.5 : 2} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
