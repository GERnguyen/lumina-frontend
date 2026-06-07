import Image from "next/image";
import Link from "next/link";
import { Bell, ChevronDown, Heart, Search, ShoppingCart } from "lucide-react";

const topLinks = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "About", href: "#" },
  { label: "Contact", href: "#" },
  { label: "Become an Instructor", href: "#" },
];

export function UserProfileTopNav({ avatar }: { avatar: string }) {
  return (
    <header>
      <div className="bg-[#1D2026] px-8">
        <div className="mx-auto flex h-13 max-w-[1920px] items-center justify-between">
          <nav className="flex items-center">
            {topLinks.map((link, index) => (
              <Link
                key={link.label}
                href={link.href}
                className={
                  index === 0
                    ? "border-t-2 border-[#7C36FF] px-4 py-4 text-sm font-medium text-white"
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
            <button type="button" aria-label="Notifications" className="relative hidden text-[#1D2026] transition hover:text-[#7872FD] md:block">
              <Bell className="size-6" />
              <span className="absolute right-0 top-0 size-2 rounded-full bg-[#564FFD]" />
            </button>
            <button type="button" aria-label="Wishlist" className="hidden text-[#1D2026] transition hover:text-[#7872FD] md:block">
              <Heart className="size-6" />
            </button>
            <button type="button" aria-label="Cart" className="relative hidden text-[#1D2026] transition hover:text-[#7872FD] md:block">
              <ShoppingCart className="size-6" />
              <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-[#564FFD] text-[10px] font-medium text-white">
                2
              </span>
            </button>
            <Link href="/user-profile" aria-label="Open profile" className="relative size-12 overflow-hidden rounded-full bg-[#E9EAF0]">
              <Image src={avatar} alt="User avatar" fill sizes="48px" className="object-cover" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
