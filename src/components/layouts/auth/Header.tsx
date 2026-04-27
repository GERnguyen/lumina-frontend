"use client ";

import Link from "next/link";
import { Button, Logo } from "@/components/ui";

const Header = () => {
  return (
    <div className="sticky top-0 z-10 h-20 w-full flex justify-around items-center px-4 py-2 bg-white border-b-1 border-gray-100">
      <Logo />
      <div></div>
      <div className="flex gap-4">
        <p className="flex items-center">Don't have an account? </p>
        <Link href="/register">
          <Button content="Create Account" variant="primary" />
        </Link>
      </div>
    </div>
  );
};

export default Header;
