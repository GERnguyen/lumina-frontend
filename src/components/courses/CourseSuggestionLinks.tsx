"use client";

import Link from "next/link";

type CourseSuggestionLinksProps = {
  suggestions: Array<{
    label: string;
    href: string;
  }>;
};

export function CourseSuggestionLinks({ suggestions }: CourseSuggestionLinksProps) {
  return (
    <>
      {suggestions.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          onClick={() => {
            window.dispatchEvent(new CustomEvent("cinx:courses-search", { detail: item.label }));
          }}
          className="text-[#7872FD] transition hover:text-[#5F58F0]"
        >
          {item.label}
        </Link>
      ))}
    </>
  );
}
