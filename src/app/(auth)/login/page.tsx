import Image from "next/image";
import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/features/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
};

const LoginPage = () => {
  return (
    <div className="flex h-full w-full flex-col lg:flex-row">
      <div className="min-h-[320px] flex-1 bg-primary-100 flex items-center justify-center">
        <div className="relative w-full h-full">
          <Image
            src="/illustrators/login-hero.svg"
            alt="Login Hero"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      <div className="flex-1 bg-white flex items-center justify-center p-8">
        <Suspense fallback={<div className="text-center text-sm text-[#8C94A3]">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
};

export default LoginPage;
