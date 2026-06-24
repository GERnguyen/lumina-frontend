import Link from "next/link";

type BrandLogoProps = {
  className?: string;
  tone?: "dark" | "light";
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: {
    mark: "text-[23px]",
    word: "text-[23px]",
    height: "h-8",
    gap: "gap-2",
  },
  md: {
    mark: "text-2xl",
    word: "text-2xl",
    height: "h-9",
    gap: "gap-2.5",
  },
  lg: {
    mark: "text-[27px]",
    word: "text-[27px]",
    height: "h-10",
    gap: "gap-2.5",
  },
};

export function BrandLogo({ className = "", tone = "dark", size = "sm" }: BrandLogoProps) {
  const palette = tone === "light" ? "text-white" : "text-black";
  const scale = sizes[size];

  return (
    <Link href="/" className={`inline-flex ${scale.height} items-center ${scale.gap} whitespace-nowrap ${palette} ${className}`}>
      <span className={`flex h-full items-center font-logo ${scale.mark} font-semibold leading-none`}>
        <span className="block translate-y-[1px]">LM</span>
      </span>
      <span className={`flex h-full items-center font-general ${scale.word} font-semibold leading-none`}>
        Cinx
      </span>
    </Link>
  );
}
