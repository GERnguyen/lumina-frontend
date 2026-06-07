import Image from "next/image";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { workSteps } from "@/data/landing";
import { LandingButton } from "@/components/ui/LandingButton";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MetricBadge } from "@/components/ui/MetricBadge";

export function HowItWorksSection() {
  return (
    <section className="bg-white px-5 py-[88px] sm:px-8 lg:px-[100px]">
      <div className="mx-auto grid max-w-[1240px] items-center gap-14 lg:grid-cols-[0.92fr_1.08fr]">
        <div>
          <SectionHeader
            align="left"
            title="How our AI Career Pilot Works"
          />
          <div className="mt-10 space-y-3">
            {workSteps.map((step) => (
              <div key={step.number} className="flex gap-5">
                <span className="font-general text-[56px] font-semibold leading-none text-[#D7DBE2]">
                  {step.number}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-[#1E242C]">{step.title}</h3>
                  <p className="mt-1 max-w-[360px] text-sm leading-6 text-[#414D60]">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <LandingButton href="/register" className="mt-8" rightIcon={<ArrowRight className="size-4 -rotate-45" />}>
            Start your roadmap
          </LandingButton>
        </div>

        <div className="relative mx-auto h-[430px] w-full max-w-[540px]">
          <Image
            src="/landing/figma/work-1.png"
            alt="Student preparing for a career roadmap"
            width={440}
            height={660}
            className="absolute left-0 top-0 h-[330px] w-[220px] rounded-[20px] object-cover shadow-[0_18px_45px_rgba(0,43,107,0.14)]"
          />
          <Image
            src="/landing/figma/work-2.png"
            alt="Instructor helping a learner plan skills"
            width={440}
            height={660}
            className="absolute bottom-0 right-0 h-[330px] w-[220px] rounded-[20px] object-cover shadow-[0_18px_45px_rgba(0,43,107,0.16)]"
          />
          <MetricBadge
            value="10K+"
            label="Job Seekers"
            icon={<BadgeCheck className="size-5" />}
            className="absolute left-[29%] top-[52%]"
          />
          <div className="absolute bottom-8 left-7 flex items-center rounded-[16px] border border-white bg-white/90 p-3 pr-5 shadow-[0_18px_45px_rgba(0,43,107,0.14)] backdrop-blur">
            {["avatar-1.png", "avatar-2.png", "avatar-3.png"].map((avatar, index) => (
              <Image
                key={avatar}
                src={`/landing/figma/${avatar}`}
                alt={`Lumina learner ${index + 1}`}
                width={44}
                height={44}
                className="-mr-3 size-11 rounded-full border-2 border-white object-cover"
              />
            ))}
            <span className="ml-6 text-sm font-bold text-[#172033]">Roadmaps updated daily</span>
          </div>
        </div>
      </div>
    </section>
  );
}
