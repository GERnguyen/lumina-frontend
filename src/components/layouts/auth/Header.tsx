"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, Logo } from "@/components/ui";

const Header = () => {
  const pathname = usePathname();
  const isRegisterPage = pathname === "/register";

  return (
    <div className="sticky top-0 z-10 h-20 w-full flex justify-around items-center px-4 py-2 bg-white border-b-1 border-gray-100">
      <Logo />
      <div></div>
      <div className="flex gap-4">
        <p className="flex items-center">
          {isRegisterPage
            ? "Already have an account?"
            : "Don't have an account?"}
        </p>
        <Link href={isRegisterPage ? "/login" : "/register"}>
          <Button
            content={isRegisterPage ? "Sign In" : "Create Account"}
            variant="primary"
          />
        </Link>
      </div>
    </div>
  );
};

export default Header;
