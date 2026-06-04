import Image from "next/image";
import { clientLogos } from "@/data/landing";

export function ClientsSection() {
  return (
    <section className="bg-[#FAFAFA] px-5 py-[72px] sm:px-8 lg:px-[100px]">
      <div className="mx-auto max-w-[860px]">
        <h2 className="mx-auto max-w-[440px] text-center font-general text-4xl font-semibold leading-tight text-[#1E242C]">
          We are happy to work with incredible clients
        </h2>
        <div className="mt-10 grid grid-cols-6 gap-6 sm:grid-cols-12">
          {clientLogos.map((logo, index) => (
            <div
              key={`${logo}-${index}`}
              className="flex size-12 items-center justify-center rounded-full bg-white shadow-[0_10px_25px_rgba(0,43,107,0.08)]"
            >
              <Image src={logo} alt={`Client logo ${index + 1}`} width={28} height={28} className="max-h-7 w-auto object-contain" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
