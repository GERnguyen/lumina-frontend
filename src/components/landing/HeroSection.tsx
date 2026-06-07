import Image from "next/image";
import { Search, Sparkles } from "lucide-react";
import { LandingButton } from "@/components/ui/LandingButton";
import { trustedLogos } from "@/data/landing";
import { LandingNavbar } from "./LandingNavbar";

export function HeroSection() {
  const marqueeLogos = [...trustedLogos, ...trustedLogos];

  return (
    <section id="explore" className="relative isolate h-[920px] overflow-hidden bg-white">
      <div className="absolute left-0 top-0 h-[768px] w-full overflow-hidden bg-[radial-gradient(circle_at_8%_0%,rgba(105,84,255,0.85)_0,rgba(105,84,255,0.36)_22%,transparent_45%),radial-gradient(circle_at_86%_0%,rgba(0,102,255,0.55)_0,rgba(0,102,255,0.18)_30%,transparent_58%),linear-gradient(180deg,#F8FBFF_0%,#FFFFFF_74%)]" />
      <div className="absolute inset-x-0 top-[768px] h-[152px] bg-[#FAFAFA]" />

      <LandingNavbar />

      <div className="animate-fade-up absolute left-1/2 top-[145px] z-10 flex w-full max-w-[900px] -translate-x-1/2 flex-col items-center px-5 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#FCFDFF] bg-white px-6 py-2 text-base text-[#002B6B] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(0,43,107,0.12)]">
            <Sparkles className="size-5" />
            Your #1 Platform for Courses
          </div>
          <h1 className="max-w-[846px] font-general text-5xl font-semibold leading-[1.2] text-[#002B6B] sm:text-6xl lg:text-[72px]">
            Achieve your career goals with Lumina
          </h1>
          <p className="mt-4 max-w-[430px] text-base leading-6 text-[#414D60]">
            Find every skills you need to conquer your IT career
          </p>

          <div className="mt-12 flex flex-col items-center gap-2 sm:flex-row">
            <label className="flex h-16 w-full max-w-[499px] items-center gap-4 rounded-full border border-[#EDEDED] bg-white py-4 pl-6 pr-8 shadow-[8px_8px_28px_rgba(0,0,0,0.05)] transition duration-300 focus-within:-translate-y-0.5 focus-within:border-[#8AB9FF] focus-within:shadow-[0_18px_46px_rgba(0,102,255,0.16)] sm:w-[499px]">
              <Search className="size-6 text-[#0066FF]" />
              <span className="sr-only">Search courses</span>
              <input
                className="h-8 flex-1 border-0 bg-transparent p-0 text-base font-medium text-[#172033] placeholder:text-[#848D9B] focus:ring-0"
                placeholder="e.g. UX Designer"
                type="search"
              />
            </label>
            <LandingButton href="/courses" size="lg" className="h-14 px-12">
              Search
            </LandingButton>
          </div>
      </div>

      <div className="absolute left-1/2 top-[582px] h-[338px] w-[calc(100%+57px)] max-w-[1497px] -translate-x-1/2 overflow-hidden rounded-[20px] bg-[#FDFDFF] shadow-[0_18px_80px_rgba(0,43,107,0.05)]">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-28 bg-gradient-to-r from-[#FDFDFF] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-28 bg-gradient-to-l from-[#FDFDFF] to-transparent" />
        <div className="animate-logo-marquee flex h-full w-max items-center gap-20 px-16">
          {marqueeLogos.map((logo, index) => {
            const Icon = logo.icon;

            return (
              <div key={`${logo.name}-${index}`} className="flex h-[230px] min-w-[220px] items-center justify-center transition duration-500 hover:scale-105">
                {logo.image ? (
                  <Image src={logo.image} alt={logo.name} width={logo.width} height={logo.height} className="max-h-[210px] w-auto object-contain" priority={index < trustedLogos.length} />
                ) : (
                  <span className="flex items-center gap-4 font-general text-6xl font-semibold text-[#172033]">
                    {Icon ? <Icon className="size-14 fill-current" /> : null}
                    {logo.text}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
