import Link from "next/link";
import { courseFooterGroups } from "@/data/courses";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function CoursesFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#FAFAFA] px-8 py-12 lg:px-[100px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_100%,rgba(120,114,253,0.34),transparent_22%),radial-gradient(circle_at_55%_100%,rgba(120,114,253,0.28),transparent_22%)]" />
      <div className="relative mx-auto max-w-[1320px]">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <BrandLogo size="lg" />
            <div className="mt-4 max-w-[410px] text-base leading-6 text-[#282828]">
              <p><strong>Corporate Head Office:</strong> 1 Vo Van Ngan Street, Thu Duc, .</p>
              <p>Ho Chi Minh City, Vietnam</p>
              <p><strong>Phone:</strong> 36-3636-3636</p>
              <p><strong>Email:</strong> info@cinx.com</p>
            </div>
          </div>

          {courseFooterGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-xl font-bold text-[#1E242C]">{group.title}</h3>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-base text-[#414D60] transition hover:text-[#7872FD]">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-5 border-t border-[#E9EAF0] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base text-[#002B6B]">©2026 All rights reserved</p>
          <div className="flex gap-5">
            {["f", "in", "x", "ig"].map((icon) => (
              <span key={icon} className="flex size-7 items-center justify-center rounded-full bg-white text-xs font-bold text-[#002B6B] shadow-sm">
                {icon}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
