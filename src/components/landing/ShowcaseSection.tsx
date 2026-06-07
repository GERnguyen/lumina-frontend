import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { showcaseItems } from "@/data/landing";
import { LandingButton } from "@/components/ui/LandingButton";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function ShowcaseSection() {
  return (
    <section className="bg-[#FAFAFA] px-5 py-[88px] sm:px-8 lg:px-[100px]">
      <div className="mx-auto max-w-[1240px]">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            align="left"
            title="Top Talent learners Showcase"
            className="max-w-2xl"
          />
          <LandingButton href="/register" rightIcon={<ArrowRight className="size-4" />}>
            Join showcase
          </LandingButton>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {showcaseItems.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.name} className="group relative min-h-[430px] overflow-hidden rounded-[20px] bg-[#DCE8FA] shadow-[0_18px_50px_rgba(0,43,107,0.1)]">
                <Image
                  src={item.image}
                  alt={`${item.name} showcase`}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#061835]/82 via-[#061835]/16 to-transparent" />
                <button
                  type="button"
                  className="absolute bottom-6 right-6 z-10 flex size-11 items-center justify-center rounded-full bg-[#0066FF] text-white shadow-[0_18px_45px_rgba(0,43,107,0.22)]"
                  aria-label={`Play ${item.name} showcase`}
                >
                  <Icon className="ml-0.5 size-6 fill-current" />
                </button>
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <h3 className="text-base font-bold">{item.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-white/76">{item.role}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
