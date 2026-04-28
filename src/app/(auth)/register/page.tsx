import Image from "next/image";
import { Input, Button, CheckBox } from "@/components/ui";

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
           <div className="grid grid-cols-2 gap-4">
             <Input label="Password" placeholder="Enter your password"></Input>
             <Input label="Confirm Password" placeholder="Enter your confirm password"></Input>
           </div>
           <div className="flex items-center justify-between mt-5">
              <CheckBox label="I Agree with all of your Terms & Conditions"></CheckBox>
             <Button content="Create Account"></Button>
           </div>
           
           
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;