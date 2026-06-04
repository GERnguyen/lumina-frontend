import Link from "next/link";
import { ArrowRight, Menu } from "lucide-react";
import { landingNavItems } from "@/data/landing";
import { LandingButton } from "@/components/ui/LandingButton";

export function LandingNavbar() {
  return (
    <header className="absolute left-1/2 top-6 z-20 flex w-full max-w-[1240px] -translate-x-1/2 items-center justify-between px-5 sm:px-0">
      <Link href="/" className="font-logo text-[23px] font-semibold text-white">
        LM <span className="font-general font-semibold">Lumina</span>
      </Link>

      <nav className="hidden items-center gap-10 rounded-full px-8 py-3 text-base font-normal text-[#272F3A] md:flex">
        {landingNavItems.map((item) => (
          <Link key={item.href} href={item.href} className="transition hover:text-[#0066FF]">
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="hidden items-center gap-3 md:flex">
        <LandingButton href="/register" variant="ghost" size="sm" className="border border-white/80 pl-6 pr-1 text-white" rightIcon={<span className="flex size-10 items-center justify-center rounded-full bg-white text-[#002B6B]"><ArrowRight className="size-4 -rotate-45" /></span>}>
          Register Now
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
