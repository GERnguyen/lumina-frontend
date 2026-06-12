"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const topLinks = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "About", href: "/#features" },
  { label: "Contact", href: "/#faq" },
  { label: "Become an Instructor", href: "/register" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/courses") return pathname.startsWith("/courses");
  return false;
}

export function TopNavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center">
      {topLinks.map((link) => {
        const active = isActivePath(pathname, link.href);
        return (
          <Link
            key={link.label}
            href={link.href}
            className={cn(
              "px-4 py-4 text-sm font-medium transition hover:text-white",
              active ? "border-t-2 border-[#7C36FF] text-white" : "text-[#8C94A3]",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
