import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function TestimonialsSection() {
  return (
    <section className="bg-white px-5 py-[88px] sm:px-8 lg:px-[100px]">
      <div className="mx-auto max-w-[1240px]">
        <h2 className="font-general text-[32px] font-semibold leading-tight text-[#1E242C]">
          What our clients say
        </h2>

        <div className="mt-8 grid items-stretch gap-8 md:grid-cols-[1fr_500px]">
          <div className="flex min-h-[500px] flex-col items-center justify-center gap-10 rounded-[20px] bg-[#1E242C] p-10 text-center text-white">
            <div className="flex items-center gap-4">
              <p className="text-xl font-semibold">Manuel Rikob</p>
              <span className="size-1 rounded-full bg-white" />
              <p className="text-xl font-semibold text-[#AAB1BA]">
                Senior Software engineer at Google
              </p>
            </div>
            <p className="max-w-[528px] font-general text-[40px] font-semibold leading-[1.2]">
              “Courses at Cinx are built different. They gave me all the knowledges needed to boost my career”
            </p>
            <div className="flex gap-4">
              <button className="flex size-16 items-center justify-center rounded-full bg-[#EDEEF0] text-[#1E242C]" aria-label="Previous testimonial">
                <ArrowLeft className="size-6" />
              </button>
              <button className="flex size-16 items-center justify-center rounded-full bg-[#0066FF] text-white" aria-label="Next testimonial">
                <ArrowRight className="size-6" />
              </button>
            </div>
          </div>

          <div className="relative min-h-[430px] overflow-hidden rounded-[34px] bg-[#DCE8FA] shadow-[0_28px_80px_rgba(0,43,107,0.12)]">
            <Image
              src="/landing/figma/testimonial-person.png"
              alt="Manuel Rikob - Senior Software Engineer at Google"
              fill
              sizes="(min-width: 768px) 500px, 100vw"
              className="object-cover object-top"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
