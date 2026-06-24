import Link from "next/link";
import { Heart, Search, ShoppingCart } from "lucide-react";
import type { UserDto } from "@/types";
import { CoursesUserMenu } from "@/components/courses/CoursesUserMenu";
import { TopNavLinks } from "@/components/courses/TopNavLinks";
import { InstructorNotifications } from "@/components/instructor/notifications/InstructorNotifications";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { API_BASE_URL } from "@/lib/api-base";
import { authHeaders } from "@/lib/server-auth";
import { getNavCounts } from "@/services/api/nav-api";

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
  const [user, counts] = await Promise.all([getCurrentUser(), getNavCounts()]);

  return (
    <header>
      <div className="bg-[#1D2026] px-8">
        <div className="mx-auto flex h-13 max-w-[1920px] items-center justify-between">
          <TopNavLinks />
        </div>
      </div>

      <div className="border-b border-[#E9EAF0] bg-white px-6 py-6 lg:px-8">
        <div className="mx-auto flex max-w-[1920px] items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-6 2xl:gap-[50px]">
            <BrandLogo className="w-[150px] shrink-0 2xl:w-[187px]" />

            <div className="hidden min-w-0 items-center gap-4 lg:flex">
              <form action="/courses" className="flex h-12 w-[min(34vw,424px)] min-w-[280px] items-center gap-3 rounded-[18px] border border-[#E9EAF0] px-4 transition focus-within:border-[#7872FD]">
                <button type="submit" aria-label="Search courses">
                  <Search className="size-6 text-[#8C94A3]" />
                </button>
                <input name="query" className="w-full border-0 p-0 text-base text-[#1D2026] placeholder:text-[#8C94A3] focus:ring-0" placeholder="What do you want learn..." />
              </form>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {user ? (
              <InstructorNotifications
                emptyDescription="Learning updates, payment messages, Q&A replies, and certificates will appear here."
                buttonClassName="hidden text-[#1D2026] hover:text-[#7872FD] md:flex"
                iconClassName="size-6"
              />
            ) : null}
            <Link href="/user-profile/wishlist" aria-label="Wishlist" className="relative hidden text-[#1D2026] transition hover:text-[#7872FD] md:block">
              <Heart className="size-6" />
              {counts.wishlistCount > 0 ? (
                <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-[#564FFD] text-[10px] font-medium text-white">
                  {counts.wishlistCount > 9 ? "9+" : counts.wishlistCount}
                </span>
              ) : null}
            </Link>
            <Link href="/cart" aria-label="Cart" className="relative hidden text-[#1D2026] transition hover:text-[#7872FD] md:block">
              <ShoppingCart className="size-6" />
              {counts.cartCount > 0 ? (
                <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-[#564FFD] text-[10px] font-medium text-white">
                  {counts.cartCount > 9 ? "9+" : counts.cartCount}
                </span>
              ) : null}
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
