import Link from "next/link";
import {
  BarChart3,
  CreditCard,
  MessageCircle,
  PlusCircle,
  Settings,
  SquareStack,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { InstructorSignOutButton } from "@/components/instructor/InstructorSignOutButton";

const navItems = [
  { key: "dashboard", label: "Dashboard", href: "/instructor", icon: BarChart3 },
  { key: "create-course", label: "Create New Course", href: "/instructor/courses/new", icon: PlusCircle },
  { key: "courses", label: "My Courses", href: "/instructor/courses", icon: SquareStack },
  { key: "earning", label: "Earning", href: "/instructor/earning", icon: CreditCard },
  { key: "messages", label: "Message", href: "/instructor/messages", icon: MessageCircle, badge: 3 },
  { key: "settings", label: "Settings", href: "/instructor/settings", icon: Settings },
];

type InstructorSidebarProps = {
  activeItem?: "dashboard" | "create-course" | "courses" | "earning" | "messages" | "settings";
};

export function InstructorSidebar({ activeItem = "dashboard" }: InstructorSidebarProps) {
  return (
    <aside className="sticky top-0 hidden h-screen w-[280px] shrink-0 flex-col bg-[#1D2026] xl:flex">
      <div className="flex h-[70px] items-center border-b border-[#363B47] px-6">
        <BrandLogo tone="light" size="sm" className="text-white" />
      </div>

      <nav className="mt-4 flex flex-1 flex-col">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === activeItem;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex h-12 items-center gap-3 px-6 text-sm font-medium tracking-[-0.14px] transition ${
                isActive ? "bg-[#564FFD] text-white" : "text-[#8C94A3] hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="size-5" />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.badge ? (
                <span className="flex min-w-6 items-center justify-center rounded-full bg-[#564FFD] px-2 py-1 text-xs text-white">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <InstructorSignOutButton />
    </aside>
  );
}
