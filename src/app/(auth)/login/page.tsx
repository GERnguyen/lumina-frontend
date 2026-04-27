import Image from "next/image";
import { Input, Button } from "@/components/ui";

const RegisterPage = () => {
  return (
    /* h-full là bắt buộc để nó nhận chiều cao từ ô Grid của Layout */
    <div className="flex flex-row h-full w-full">
      <div className="flex-1 bg-primary-100 flex items-center justify-center">
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

      <div className="flex-1 bg-white flex items-center justify-center">
        <form action="" className="flex flex-col gap-2 justify-between w-[50%]">
           <h1 className="text-center mb-4">Create your account</h1> 
           <Input label="Name" placeholder="Enter your name"></Input>
           <Input label="Email" placeholder="Enter your email"></Input>
           <Input label="Password" placeholder="Enter your password"></Input>
           <Input label="Confirm Password" placeholder="Enter your confirm password"></Input>
           <Button content="Create Account"></Button>
           
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;