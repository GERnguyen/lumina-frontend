import Link from "next/link";
import { Bell, ChevronDown, Heart, Search, ShoppingCart } from "lucide-react";

const topLinks = ["Home", "Courses", "About", "Contact", "Become an Instructor"];

export function CoursesTopNav() {
  return (
    <header>
      <div className="bg-[#1D2026] px-8">
        <div className="mx-auto flex h-13 max-w-[1920px] items-center justify-between">
          <nav className="flex items-center">
            {topLinks.map((link, index) => (
              <Link
                key={link}
                href={link === "Home" ? "/" : "#"}
                className={
                  index === 0
                    ? "border-t-2 border-[#7C36FF] bg-[#1D2026] px-4 py-4 text-sm font-medium text-white"
                    : "px-4 py-4 text-sm font-medium text-[#8C94A3] transition hover:text-white"
                }
              >
                {link}
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
              <button className="flex h-12 w-[160px] shrink-0 items-center justify-between rounded-[18px] border border-[#E9EAF0] px-4 text-base text-[#4E5566] 2xl:w-[200px]">
                Browse <ChevronDown className="size-4" />
              </button>
              <label className="flex h-12 w-[min(34vw,424px)] min-w-[280px] items-center gap-3 rounded-[18px] border border-[#E9EAF0] px-4">
                <Search className="size-6 text-[#8C94A3]" />
                <span className="sr-only">Search courses</span>
                <input className="w-full border-0 p-0 text-base text-[#1D2026] placeholder:text-[#8C94A3] focus:ring-0" placeholder="What do you want learn..." />
              </label>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Bell className="hidden size-6 text-[#1D2026] md:block" />
            <Heart className="hidden size-6 text-[#1D2026] md:block" />
            <ShoppingCart className="hidden size-6 text-[#1D2026] md:block" />
            <div className="flex gap-3">
              <Link href="/register" className="hidden h-12 items-center rounded-[18px] bg-[#EBEBFF] px-6 text-base font-semibold text-[#7872FD] 2xl:flex">
                Create Account
              </Link>
              <Link href="/login" className="flex h-12 items-center rounded-[18px] bg-[#7872FD] px-6 text-base font-semibold text-white">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
