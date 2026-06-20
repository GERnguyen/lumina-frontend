import Link from "next/link";
import { ArrowRight, Menu } from "lucide-react";
import { landingNavItems } from "@/data/landing";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { LandingButton } from "@/components/ui/LandingButton";

export function LandingNavbar() {
  return (
    <header className="absolute left-1/2 top-6 z-20 flex w-full max-w-[1240px] -translate-x-1/2 items-center justify-between px-5 sm:px-0">
      <BrandLogo tone="light" />

      <nav className="hidden items-center gap-10 rounded-full px-8 py-3 text-base font-normal text-[#272F3A] md:flex">
        {landingNavItems.map((item) => (
          <Link key={`${item.label}-${item.href}`} href={item.href} className="transition hover:text-[#0066FF]">
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="hidden items-center gap-3 md:flex">
        <LandingButton
          href="/login"
          variant="ghost"
          size="sm"
          className="group h-14 gap-5 border border-white/85 py-1 pl-8 pr-1.5 text-lg text-white hover:border-white hover:bg-white/10"
          rightIcon={
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-[#002B6B] transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <ArrowRight className="size-5 -rotate-45" />
            </span>
          }
        >
          Sign in
        </LandingButton>
      </div>

      <button
        type="button"
        className="flex size-11 items-center justify-center rounded-full border border-white/24 bg-white/12 text-white backdrop-blur md:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </button>
    </header>
  );
}
