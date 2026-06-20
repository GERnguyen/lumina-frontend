import Image from "next/image";
import { clientLogos } from "@/data/landing";

export function ClientsSection() {
  const marqueeLogos = [...clientLogos, ...clientLogos];

  return (
    <section className="bg-[#FAFAFA] py-[72px]">
      <div className="w-full overflow-hidden">
        <h2 className="mx-auto max-w-[440px] text-center font-general text-4xl font-semibold leading-tight text-[#1E242C]">
          We are happy to work with incredible clients
        </h2>
        <div className="relative mt-10">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#FAFAFA] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#FAFAFA] to-transparent" />
          <div className="animate-logo-marquee flex w-max gap-8 px-8 py-2">
          {marqueeLogos.map((logo, index) => (
            <div
              key={`${logo}-${index}`}
              className="flex size-12 items-center justify-center rounded-full bg-white shadow-[0_10px_25px_rgba(0,43,107,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(0,43,107,0.14)]"
            >
              <Image src={logo} alt={`Client logo ${index + 1}`} width={28} height={28} className="max-h-7 w-auto object-contain" />
            </div>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}
