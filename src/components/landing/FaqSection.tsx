"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { faqs } from "@/data/landing";
import { cn } from "@/lib/utils";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState(3);

  return (
    <section className="bg-white px-5 py-[88px] sm:px-8 lg:px-[100px]">
      <div className="mx-auto max-w-[1240px]">
        <h2 className="animate-fade-up font-general text-[56px] font-semibold leading-[1.2] text-[#1E242C]">
          Frequently asked questions
        </h2>

        <div className="mt-[102px] grid gap-[30px] lg:grid-cols-2">
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <article
                key={`${index}-${item.question}`}
                className={cn(
                  "flex gap-4 rounded-[20px] border p-6 transition",
                  isOpen
                    ? "border-[#8AB9FF] bg-[#E6F0FF] shadow-[10px_25px_50px_rgba(0,43,107,0.18)]"
                    : "border-[#E6E9EA] bg-white hover:-translate-y-1 hover:border-[#C9DCFF] hover:shadow-[0_18px_42px_rgba(0,43,107,0.08)]",
                )}
              >
                <span className={cn("flex size-14 shrink-0 items-center justify-center rounded-full text-xl font-medium text-[#002B6B]", isOpen ? "bg-white" : "bg-[#EDEEF0]")}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex-1">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 text-left"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                >
                  <span className="font-general text-2xl font-semibold leading-[1.2] text-[#1E242C]">{item.question}</span>
                  <span className="flex size-6 shrink-0 items-center justify-center text-[#0066FF]">
                    {isOpen ? <Minus className="size-5" /> : <Plus className="size-5" />}
                  </span>
                </button>
                {isOpen ? (
                  <p className="animate-fade-up mt-4 max-w-xl text-sm leading-6 text-[#697589]">
                    {item.answer}
                  </p>
                ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
