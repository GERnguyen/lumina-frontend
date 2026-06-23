"use client";

import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { OtpModal } from "./OtpModal";
import {
  Input,
  CheckBox,
  Button,
  Radio,
  Password,
  Select,
  FileUpload,
} from "@/components/ui";
import type { RegisterRequest } from "@/types";
import { AuthService } from "@/services";
import { getErrorMessage } from "@/lib/errors";
import { uploadFileWithPresignedUrl } from "@/lib/presigned-upload";
import { GoogleSignInButton } from "./GoogleSignInButton";

type RegisterRole = NonNullable<RegisterRequest["role"]>;
type RegisterGender = NonNullable<RegisterRequest["gender"]>;

async function uploadInstructorCv(file: File) {
  return uploadFileWithPresignedUrl(file, {
    fallbackContentType: "application/pdf",
    prepareError: "Could not prepare CV upload",
    uploadError: "Could not upload instructor CV.",
  });
}

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "USER" as RegisterRole,
    gender: "MALE" as RegisterGender,
    phoneNumber: "",
    bio: "",
    agreeToTerms: false,
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();
  const [showOtpModal, setShowOtpModal] = useState(false);

  const registerMutation = useMutation({
    mutationFn: async () => {
      setFormError(undefined);
      setSuccessMessage(undefined);

      if (formData.password !== formData.confirmPassword) {
        throw new Error("Password confirmation does not match.");
      }

      if (!formData.agreeToTerms) {
        throw new Error("Please agree to the terms before creating an account.");
      }

      let cvFileKey: string | undefined;

      if (formData.role === "INSTRUCTOR") {
        if (!cvFile) {
          throw new Error("Please upload your instructor CV.");
        }

        if (cvFile.type !== "application/pdf") {
          throw new Error("Instructor CV must be a PDF file.");
        }

        cvFileKey = await uploadInstructorCv(cvFile);
      }

      const res = await AuthService.register({
        body: {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          gender: formData.gender,
          phoneNumber: formData.phoneNumber || undefined,
          bio: formData.bio || undefined,
          cvFileKey,
        },
      });

      if (res.success === false) {
        throw new Error(res.message || "Registration failed");
      }

      return res;
    },
    onSuccess: () => {
      setSuccessMessage(
        "Account created. Please check your email for the verification OTP.",
      );
      setShowOtpModal(true);
    },
    onError: (error) => {
      setFormError(getErrorMessage(error, "Unable to create account"));
    },
  });

  const selectedRole = formData.role;

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      role: event.target.value as RegisterRole,
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setCvFile(null);
      return;
    }

    if (file.type !== "application/pdf") {
      setFormError("Only PDF CV files are supported.");
      event.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setFormError("CV file must be 5MB or smaller.");
      event.target.value = "";
      return;
    }

    setFormError(undefined);
    setCvFile(file);
  };

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    registerMutation.mutate();
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex w-full max-w-xl flex-col gap-4">
        <div className="space-y-2 text-center">
          <h1>Create your account</h1>
          <p>Start learning or build your first course on Lumina.</p>
        </div>

        {formError && (
          <div className="rounded-lg border border-danger-200 bg-danger-100 px-4 py-3 text-sm text-danger-700">
            {formError}
          </div>
        )}

        {successMessage && (
          <div className="rounded-lg border border-success-200 bg-success-100 px-4 py-3 text-sm text-success-700">
            {successMessage}{" "}
            <Link href="/login" className="font-semibold underline">
              Go to sign in
            </Link>
          </div>
        )}

        <div className="flex flex-col">
          <label className="block mb-2 text-sm font-medium text-foreground">
            User Type
          </label>
          <div className="flex flex-row gap-2">
            <Radio
              name="role"
              value="USER"
              checked={selectedRole === "USER"}
              onChange={handleOptionChange}
              label="Student"
              id="USER"
            />
            <Radio
              name="role"
              value="INSTRUCTOR"
              checked={selectedRole === "INSTRUCTOR"}
              onChange={handleOptionChange}
              label="Instructor"
              id="INSTRUCTOR"
            />
          </div>
        </div>
        <Input
          id="name"
          name="name"
          label="Name"
          placeholder="Enter your name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          autoComplete="name"
          required
        />
        <Input
          id="email"
          name="email"
          label="Email"
          placeholder="Enter your email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          autoComplete="email"
          required
        />
        <Password
          purpose="register"
          id="password"
          name="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          secondValue={formData.confirmPassword}
          secondOnChange={(e) =>
            setFormData({ ...formData, confirmPassword: e.target.value })
          }
          autoComplete="new-password"
          required
        />
        <Select
          options={[
            { label: "Male", value: "MALE" },
            { label: "Female", value: "FEMALE" },
          ]}
          label="Gender"
          id="gender"
          value={formData.gender}
          onChange={(e) =>
            setFormData({
              ...formData,
              gender: e.target.value as RegisterGender,
            })
          }
        />
        <Input
          id="phoneNumber"
          name="phoneNumber"
          label="Phone Number"
          placeholder="Enter your phone number"
          value={formData.phoneNumber}
          onChange={(e) =>
            setFormData({ ...formData, phoneNumber: e.target.value })
          }
          autoComplete="tel"
        />
        {selectedRole === "INSTRUCTOR" && (
          <>
            <Input
              id="bio"
              name="bio"
              label="Instructor Bio"
              placeholder="Tell learners about your expertise"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
            <FileUpload
              label="Instructor CV"
              id="cv"
              contentType="document"
              accept="application/pdf"
              onChange={handleFileChange}
              helperText={
                cvFile ? (
                  <span>
                    Selected:{" "}
                    <span className="font-medium text-foreground">
                      {cvFile.name}
                    </span>
                  </span>
                ) : undefined
              }
            />
          </>
        )}
        <div className="flex flex-col gap-4 pt-2">
          <CheckBox
            id="terms"
            label="I agree with the Terms & Conditions"
            checked={formData.agreeToTerms}
            onChange={(e) =>
              setFormData({ ...formData, agreeToTerms: e.target.checked })
            }
          />
          <Button
            type="submit"
            loading={registerMutation.isPending}
            className="w-full"
          >
            Create Account
          </Button>

          <div className="relative flex items-center gap-3 py-1">
            <span className="h-px flex-1 bg-[#E9EAF0]" />
            <span className="text-xs font-medium text-[#8C94A3]">Or sign up with</span>
            <span className="h-px flex-1 bg-[#E9EAF0]" />
          </div>

          <GoogleSignInButton role={formData.role === "INSTRUCTOR" ? "INSTRUCTOR" : "USER"} />
        </div>
      </form>

      <OtpModal
        email={formData.email}
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onSuccess={() => {
          window.location.href = "/login";
        }}
      />
    </>
  );
};

export default RegisterForm;
