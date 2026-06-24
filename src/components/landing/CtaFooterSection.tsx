import Link from "next/link";
import { Mail } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { LandingButton } from "@/components/ui/LandingButton";

const quickLinks = ["Pricing", "Jobs", "Employeer", "Careers", "Contact Us"];
const others = ["How it works", "Terms and condition", "Privacy Policy", "About Us"];
const about = ["Company milestone", "Web mail", "Board of Directors", "Senior Management"];

export function CtaFooterSection() {
  return (
    <section id="contact" className="relative bg-white px-5 pb-0 pt-[28px] sm:px-8 lg:px-[100px]">
      <div className="relative z-10 mx-auto flex max-w-[1240px] justify-center overflow-hidden rounded-[24px] bg-[#FAFAFA] px-6 py-[88px] shadow-[0_16px_40px_rgba(57,29,232,0.08)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(120,95,255,0.45),transparent_36%),radial-gradient(circle_at_100%_0%,rgba(0,102,255,0.32),transparent_42%),linear-gradient(180deg,#F8FBFF_0%,#FAFAFA_80%)]" />
        <div className="relative flex max-w-[670px] flex-col items-center text-center">
          <h2 className="font-general text-[40px] font-semibold leading-[1.2] text-[#1E242C]">
            Join ambitious professionals and unlock your dream career today
          </h2>
          <p className="mt-4 max-w-[561px] text-base leading-6 text-[#414D60]">
            Unlock your true potential and discover a world of opportunities that align with your skills, interests, and aspirations
          </p>
          <div className="mt-8 flex w-full flex-col justify-center gap-2 sm:flex-row">
            <label className="flex h-14 w-full items-center gap-2 rounded-full border border-[#EDEDED] bg-white px-6 shadow-[8px_8px_28px_rgba(0,0,0,0.05)] sm:w-[384px]">
              <Mail className="size-5 text-[#0066FF]" />
              <span className="sr-only">Email address</span>
              <input className="flex-1 border-0 bg-transparent p-0 text-base font-medium text-[#1E242C] placeholder:text-[#848D9B] focus:ring-0" placeholder="Your mail address" />
            </label>
            <LandingButton href="/register" className="h-14 px-12">
              Join Us
            </LandingButton>
          </div>
        </div>
      </div>

      <footer className="-mt-[116px] bg-[#FAFAFA] px-0 pb-12 pt-[316px]">
        <div className="mx-auto grid max-w-[1240px] gap-10 lg:grid-cols-[1.45fr_0.55fr_0.65fr_0.7fr]">
          <div>
            <BrandLogo size="lg" />
            <div className="mt-5 max-w-[430px] space-y-1 text-base leading-6 text-[#282828]">
              <p><strong>Corporate Head Office:</strong> 1 Vo Van Ngan Street, Thu Duc, .</p>
              <p>Ho Chi Minh City, Vietnam</p>
              <p><strong>Phone:</strong> 36-3636-3636</p>
              <p><strong>Email:</strong> info@cinx.com</p>
            </div>
          </div>

          <FooterColumn title="Quick Links" links={quickLinks} />
          <FooterColumn title="Others" links={others} />
          <FooterColumn title="About us" links={about} />
        </div>

        <div className="mx-auto mt-20 flex max-w-[1240px] flex-col gap-6 border-t border-[#E6E9EA] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base text-[#002B6B]">©2026 All rights reserved</p>
          <div className="flex gap-5">
            {["f", "in", "x", "ig"].map((item) => (
              <span key={item} className="flex size-7 items-center justify-center rounded-full bg-[#E6F0FF] text-xs font-bold text-[#0066FF]">
                {item}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </section>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h3 className="text-xl font-bold text-[#1E242C]">{title}</h3>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link}>
            <Link href="#" className="text-base leading-6 text-[#414D60] transition hover:text-[#0066FF]">
              {link}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
