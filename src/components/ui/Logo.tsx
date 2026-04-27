import Link from "next/link";

const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="font-logo text-2xl text-black translate-y-[3px]">
        LM
      </span>

      <span className="font-general text-2xl text-black font-bold">Lumina</span>
    </Link>
  );
};

export default Logo;
