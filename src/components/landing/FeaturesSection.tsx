import Image from "next/image";
import { ArrowRight, FileText, Globe2, Play, Sparkles } from "lucide-react";
import { LandingButton } from "@/components/ui/LandingButton";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function FeaturesSection() {
  return (
    <section id="skillsets" className="overflow-hidden bg-white px-5 py-[88px] sm:px-8 lg:px-[100px]">
      <div className="mx-auto max-w-[1240px]">
        <SectionHeader
          title="Why you should choose us?"
          description="Unlock your true potential and discover a world of opportunities that align with your skills, interests, and aspirations"
        />

        <div className="relative mx-auto mt-12 h-[430px] w-full max-w-[760px]">
          <div className="absolute left-1/2 top-1/2 size-[410px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#CFE0FA]" />
          <div className="absolute left-1/2 top-1/2 size-[310px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#DCE8FA]" />
          <Image
            src="/landing/figma/feature-person.png"
            alt="Video resume example"
            width={250}
            height={340}
            unoptimized
            className="absolute left-1/2 top-1/2 h-[320px] w-[235px] -translate-x-1/2 -translate-y-1/2 rounded-[20px] object-cover shadow-[0_18px_45px_rgba(0,43,107,0.18)]"
          />
          <div className="absolute left-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#0066FF] shadow-[0_16px_38px_rgba(0,43,107,0.18)]">
            <Play className="ml-0.5 size-5 fill-current" />
          </div>

          <div className="absolute left-0 top-20 w-[206px] rounded-[16px] bg-white p-4 shadow-[0_20px_50px_rgba(0,43,107,0.18)]">
            <FileText className="size-6 text-[#0066FF]" />
            <h3 className="mt-3 text-base font-bold text-[#1E242C]">Resume Builder</h3>
            <p className="mt-1 text-xs leading-5 text-[#414D60]">Create a professional resume using our built-in resume builder.</p>
            <LandingButton href="/register" size="sm" className="mt-3 h-8 px-3 text-xs" rightIcon={<ArrowRight className="size-3" />}>
              Build Resume
            </LandingButton>
          </div>

          <div className="absolute right-0 top-14 w-[190px] rounded-[16px] bg-white p-4 shadow-[0_20px_50px_rgba(0,43,107,0.18)]">
            <Sparkles className="size-6 text-[#0066FF]" />
            <h3 className="mt-3 text-base font-bold text-[#1E242C]">Building Skills</h3>
          </div>

          <div className="absolute bottom-14 right-7 w-[210px] rounded-[16px] bg-white p-4 shadow-[0_20px_50px_rgba(0,43,107,0.18)]">
            <Globe2 className="size-6 text-[#0066FF]" />
            <h3 className="mt-3 text-base font-bold text-[#1E242C]">Showcase Work</h3>
            <p className="mt-1 text-xs leading-5 text-[#414D60]">Showcase your projects in our community</p>
          </div>

          <div className="absolute bottom-10 left-12 rounded-[16px] bg-white px-5 py-4 shadow-[0_20px_50px_rgba(0,43,107,0.16)]">
            <p className="text-2xl font-bold text-[#002B6B]">100K+</p>
            <p className="text-xs text-[#414D60]">Worldwide Active Users</p>
          </div>
        </div>
      </div>
    </section>
  );
}
