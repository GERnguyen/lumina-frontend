import Image from "next/image";
import { Search, Sparkles } from "lucide-react";
import { LandingButton } from "@/components/ui/LandingButton";
import { LandingNavbar } from "./LandingNavbar";

export function HeroSection() {
  return (
    <section id="explore" className="relative isolate h-[920px] overflow-hidden bg-white">
      <div className="absolute left-0 top-0 h-[768px] w-full overflow-hidden bg-[radial-gradient(circle_at_8%_0%,rgba(105,84,255,0.85)_0,rgba(105,84,255,0.36)_22%,transparent_45%),radial-gradient(circle_at_86%_0%,rgba(0,102,255,0.55)_0,rgba(0,102,255,0.18)_30%,transparent_58%),linear-gradient(180deg,#F8FBFF_0%,#FFFFFF_74%)]" />
      <div className="absolute inset-x-0 top-[768px] h-[152px] bg-[#FAFAFA]" />

      <LandingNavbar />

      <div className="absolute left-1/2 top-[145px] z-10 flex w-full max-w-[900px] -translate-x-1/2 flex-col items-center px-5 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#FCFDFF] bg-white px-6 py-2 text-base text-[#002B6B] shadow-sm">
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
            <label className="flex h-16 w-full max-w-[499px] items-center gap-4 rounded-full border border-[#EDEDED] bg-white py-4 pl-6 pr-8 shadow-[8px_8px_28px_rgba(0,0,0,0.05)] sm:w-[499px]">
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

      <div className="absolute left-1/2 top-[582px] h-[338px] w-[calc(100%+57px)] max-w-[1497px] -translate-x-1/2 overflow-hidden rounded-[20px] bg-[#FDFDFF]">
        <Image src="/landing/figma/hero-google.png" alt="Google" width={216} height={212} className="absolute left-[72px] top-[63px] h-[212px] w-[216px] object-contain" priority />
        <Image src="/landing/figma/hero-ibm.png" alt="IBM" width={255} height={104} className="absolute left-[397px] top-[117px] h-[104px] w-[255px] object-contain" priority />
        <Image src="/landing/figma/hero-microsoft.png" alt="Microsoft" width={381} height={122} className="absolute left-[761px] top-[108px] h-[122px] w-[381px] object-contain" priority />
        <Image src="/landing/figma/hero-meta.png" alt="Meta" width={238} height={230} className="absolute left-[1251px] top-[54px] h-[230px] w-[238px] object-contain" priority />
      </div>
    </section>
  );
}
