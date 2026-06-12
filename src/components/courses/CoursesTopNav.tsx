import Link from "next/link";
import { Bell, ChevronDown, Heart, Search, ShoppingCart } from "lucide-react";
import type { UserDto } from "@/api/generated/user";
import { CoursesUserMenu } from "@/components/courses/CoursesUserMenu";
import { API_BASE_URL } from "@/lib/api-base";
import { authHeaders } from "@/lib/server-auth";

const topLinks = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "About", href: "/#features" },
  { label: "Contact", href: "/#faq" },
  { label: "Become an Instructor", href: "/register" },
];

type UserPayload = {
  data?: UserDto;
};

async function getCurrentUser() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
      cache: "no-store",
      headers: await authHeaders({ Accept: "application/json" }),
    });

    if (!response.ok) return undefined;
    const payload = (await response.json()) as UserPayload;
    return payload.data;
  } catch {
    return undefined;
  }
}

export async function CoursesTopNav() {
  const user = await getCurrentUser();

  return (
    <header>
      <div className="bg-[#1D2026] px-8">
        <div className="mx-auto flex h-13 max-w-[1920px] items-center justify-between">
          <nav className="flex items-center">
            {topLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={
                  link.label === "Courses"
                    ? "border-t-2 border-[#7C36FF] bg-[#1D2026] px-4 py-4 text-sm font-medium text-white"
                    : "px-4 py-4 text-sm font-medium text-[#8C94A3] transition hover:text-white"
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-6 text-sm text-[#A1A5B3] md:flex">
            <span className="inline-flex items-center gap-1.5">
              USD <ChevronDown className="size-3" />
            </span>
            <span className="inline-flex items-center gap-1.5">
              English <ChevronDown className="size-3" />
            </span>
          </div>
        </div>
      </div>

      <div className="border-b border-[#E9EAF0] bg-white px-6 py-6 lg:px-8">
        <div className="mx-auto flex max-w-[1920px] items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-6 2xl:gap-[50px]">
            <Link href="/" className="inline-flex w-[150px] shrink-0 whitespace-nowrap font-logo text-[23px] font-semibold text-black 2xl:w-[187px]">
              LM <span className="font-general font-semibold">Lumina</span>
            </Link>

            <div className="hidden min-w-0 items-center gap-4 lg:flex">
              <Link href="/courses" className="flex h-12 w-[160px] shrink-0 items-center justify-between rounded-[18px] border border-[#E9EAF0] px-4 text-base text-[#4E5566] transition hover:border-[#7872FD] hover:text-[#7872FD] 2xl:w-[200px]">
                Browse <ChevronDown className="size-4" />
              </Link>
              <form action="/courses" className="flex h-12 w-[min(34vw,424px)] min-w-[280px] items-center gap-3 rounded-[18px] border border-[#E9EAF0] px-4 transition focus-within:border-[#7872FD]">
                <button type="submit" aria-label="Search courses">
                  <Search className="size-6 text-[#8C94A3]" />
                </button>
                <input name="query" className="w-full border-0 p-0 text-base text-[#1D2026] placeholder:text-[#8C94A3] focus:ring-0" placeholder="What do you want learn..." />
              </form>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Bell className="hidden size-6 text-[#1D2026] md:block" />
            <Link href="/user-profile/wishlist" aria-label="Wishlist" className="hidden text-[#1D2026] transition hover:text-[#7872FD] md:block">
              <Heart className="size-6" />
            </Link>
            <Link href="/courses" aria-label="Cart" className="hidden text-[#1D2026] transition hover:text-[#7872FD] md:block">
              <ShoppingCart className="size-6" />
            </Link>
            {user ? (
              <CoursesUserMenu user={user} />
            ) : (
              <div className="flex gap-3">
                <Link href="/register" className="hidden h-12 items-center rounded-[18px] bg-[#EBEBFF] px-6 text-base font-semibold text-[#7872FD] 2xl:flex">
                  Create Account
                </Link>
                <Link href="/login" className="flex h-12 items-center rounded-[18px] bg-[#7872FD] px-6 text-base font-semibold text-white">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
