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

        <div className="relative mx-auto mt-14 h-[520px] w-full max-w-[980px]">
          <div className="absolute left-1/2 top-1/2 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#CFE0FA]" />
          <div className="absolute left-1/2 top-1/2 size-[374px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#DCE8FA]" />
          <Image
            src="/landing/figma/feature-person.png"
            alt="Video resume example"
            width={250}
            height={340}
            unoptimized
            className="absolute left-1/2 top-1/2 h-[380px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-[20px] object-cover shadow-[0_18px_45px_rgba(0,43,107,0.18)]"
          />
          <div className="absolute left-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#0066FF] shadow-[0_16px_38px_rgba(0,43,107,0.18)]">
            <Play className="ml-0.5 size-5 fill-current" />
          </div>

          <div className="absolute left-0 top-20 w-[286px] rounded-[18px] bg-white p-6 shadow-[0_24px_58px_rgba(0,43,107,0.18)]">
            <FileText className="size-8 text-[#0066FF]" />
            <h3 className="mt-4 text-xl font-bold text-[#1E242C]">Resume Builder</h3>
            <p className="mt-2 text-sm leading-6 text-[#414D60]">Create a professional resume using our built-in resume builder.</p>
            <LandingButton href="/register" size="sm" className="mt-5 h-10 px-4 text-sm" rightIcon={<ArrowRight className="size-3" />}>
              Build Resume
            </LandingButton>
          </div>

          <div className="absolute right-0 top-12 w-[260px] rounded-[18px] bg-white p-6 shadow-[0_24px_58px_rgba(0,43,107,0.18)]">
            <Sparkles className="size-8 text-[#0066FF]" />
            <h3 className="mt-4 text-xl font-bold text-[#1E242C]">Building Skills</h3>
            <p className="mt-2 text-sm leading-6 text-[#414D60]">Practice with guided lessons, quizzes, and projects.</p>
          </div>

          <div className="absolute bottom-16 right-8 w-[278px] rounded-[18px] bg-white p-6 shadow-[0_24px_58px_rgba(0,43,107,0.18)]">
            <Globe2 className="size-8 text-[#0066FF]" />
            <h3 className="mt-4 text-xl font-bold text-[#1E242C]">Showcase Work</h3>
            <p className="mt-2 text-sm leading-6 text-[#414D60]">Showcase your projects in our community.</p>
          </div>

          <div className="absolute bottom-10 left-12 rounded-[18px] bg-white px-7 py-6 shadow-[0_24px_58px_rgba(0,43,107,0.16)]">
            <p className="text-4xl font-bold text-[#002B6B]">100K+</p>
            <p className="mt-1 text-sm text-[#414D60]">Worldwide Active Users</p>
          </div>
        </div>
      </div>
    </section>
  );
}
