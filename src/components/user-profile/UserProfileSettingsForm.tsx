"use client";

import { useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import { Eye, EyeOff, Loader2, Upload } from "lucide-react";
import type { UserProfileSettingsData } from "@/data/user-profile";
import { updateProfileAction, changePasswordAction } from "@/services/actions/profile";

type ApiMessage = {
  message?: string;
};

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { firstName: parts[0] || "", lastName: "" };
  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts.at(-1) || "",
  };
}

function SettingsInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  right,
  reserveLabelSpace,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  right?: ReactNode;
  reserveLabelSpace?: boolean;
}) {
  return (
    <label className="block">
      {label ? <span className="mb-1.5 block text-sm leading-[22px] tracking-[-0.14px] text-[#1D2026]">{label}</span> : null}
      {!label && reserveLabelSpace ? <span className="mb-1.5 block text-sm leading-[22px] opacity-0">Label</span> : null}
      <span className="flex h-12 items-center border border-[#E9EAF0] bg-white px-4 transition focus-within:border-[#564FFD]">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type={type}
          className="min-w-0 flex-1 border-0 p-0 text-base leading-6 text-[#1D2026] placeholder:text-[#8C94A3] focus:ring-0"
        />
        {right}
      </span>
    </label>
  );
}

function PasswordInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [visible, setVisible] = useState(false);

  return (
    <SettingsInput
      label={label}
      value={value}
      onChange={onChange}
      placeholder={label === "Confirm Password" ? "Confirm new password" : "Password"}
      type={visible ? "text" : "password"}
      right={
        <button type="button" onClick={() => setVisible((current) => !current)} className="ml-3 text-[#4E5566] transition hover:text-[#564FFD]" aria-label={visible ? "Hide password" : "Show password"}>
          {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      }
    />
  );
}

export function UserProfileSettingsForm({ settings }: { settings: UserProfileSettingsData }) {
  const nameParts = useMemo(() => splitName(settings.user.fullName), [settings.user.fullName]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState(settings.user.avatar);
  const [firstName, setFirstName] = useState(nameParts.firstName);
  const [lastName, setLastName] = useState(nameParts.lastName);
  const [username, setUsername] = useState(settings.user.username);
  const [email] = useState(settings.user.email);
  const [bio, setBio] = useState(settings.user.bio || settings.user.headline);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [pendingAction, setPendingAction] = useState<"profile" | "password" | undefined>();
  const fullName = [firstName, lastName].map((item) => item.trim()).filter(Boolean).join(" ");

  async function saveProfile() {
    setProfileMessage("");
    setPendingAction("profile");

    try {
      if (!settings.user.id) throw new Error("User ID is missing.");
      const res = await updateProfileAction(settings.user.id, {
        name: fullName,
        bio,
      });
      if (!res.success) throw new Error(res.error);
      setProfileMessage("Profile updated successfully.");
    } catch (error: any) {
      setProfileMessage(error?.message || "Could not save profile.");
    } finally {
      setPendingAction(undefined);
    }
  }

  async function changePassword() {
    setPasswordMessage("");

    if (newPassword !== confirmPassword) {
      setPasswordMessage("New password and confirmation do not match.");
      return;
    }

    setPendingAction("password");

    try {
      const res = await changePasswordAction({
        email,
        oldPassword: currentPassword,
        newPassword,
      });
      if (!res.success) throw new Error(res.error);
      setPasswordMessage("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setPasswordMessage(error?.message || "Could not change password.");
    } finally {
      setPendingAction(undefined);
    }
  }

  function handleAvatarChange(file?: File) {
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setProfileMessage("Photo preview updated. File upload will be connected when avatar storage is ready.");
  }

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-2xl font-semibold leading-8 tracking-[-0.24px] text-[#1D2026]">Account settings</h2>
        <div className="mt-6 grid gap-8 xl:grid-cols-[360px_minmax(0,872px)] xl:gap-20">
          <div className="border border-[#E9EAF0] bg-white p-8 sm:p-11">
            <div className="relative mx-auto aspect-square max-w-[280px] overflow-hidden bg-[#E9EAF0]">
              <Image src={avatarPreview} alt={settings.user.name} fill sizes="280px" className="object-cover" unoptimized={avatarPreview.startsWith("blob:")} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-x-0 bottom-0 flex h-12 items-center justify-center gap-2 bg-black/55 text-sm font-medium tracking-[-0.14px] text-white transition hover:bg-black/70"
              >
                <Upload className="size-5" />
                Upload Photo
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => handleAvatarChange(event.target.files?.[0])} />
            </div>
            <p className="mx-auto mt-5 max-w-[280px] text-center text-sm leading-[22px] tracking-[-0.14px] text-[#6E7485]">
              Image size should be under 1MB and image ratio needs to be 1:1.
            </p>
          </div>

          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <SettingsInput label="Full name" value={firstName} onChange={setFirstName} placeholder="First name" />
              <SettingsInput value={lastName} onChange={setLastName} placeholder="Last name" reserveLabelSpace />
            </div>
            <SettingsInput label="Username" value={username} onChange={setUsername} placeholder="Enter your username" />
            <SettingsInput label="Email" value={email} onChange={() => undefined} placeholder="Email address" />
            <label className="block">
              <span className="mb-1.5 block text-sm leading-[22px] tracking-[-0.14px] text-[#1D2026]">Title</span>
              <span className="flex h-12 items-center border border-[#E9EAF0] bg-white px-4 transition focus-within:border-[#564FFD]">
                <input
                  value={bio}
                  onChange={(event) => setBio(event.target.value.slice(0, 50))}
                  placeholder="Your title, profession or small biography"
                  className="min-w-0 flex-1 border-0 p-0 text-base leading-6 text-[#1D2026] placeholder:text-[#8C94A3] focus:ring-0"
                />
                <span className="ml-3 text-base leading-6 text-[#4E5566]">{bio.length}/50</span>
              </span>
            </label>
            <button
              type="button"
              onClick={() => void saveProfile()}
              disabled={pendingAction === "profile" || !settings.user.id || !fullName}
              className="inline-flex h-12 items-center justify-center gap-2 bg-[#564FFD] px-6 text-base font-semibold tracking-[-0.128px] text-white transition hover:bg-[#453FCA] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pendingAction === "profile" ? <Loader2 className="size-4 animate-spin" /> : null}
              Save Changes
            </button>
            {profileMessage ? <p className="text-sm leading-6 text-[#6E7485]">{profileMessage}</p> : null}
          </div>
        </div>
      </section>

      <div className="-mx-6 h-px bg-[#E9EAF0] lg:-mx-8" />

      <section className="max-w-[588px]">
        <h2 className="text-2xl font-semibold leading-8 tracking-[-0.24px] text-[#1D2026]">Change password</h2>
        <div className="mt-6 space-y-5">
          <PasswordInput label="Current Password" value={currentPassword} onChange={setCurrentPassword} />
          <PasswordInput label="New Password" value={newPassword} onChange={setNewPassword} />
          <PasswordInput label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} />
        </div>
        <button
          type="button"
          onClick={() => void changePassword()}
          disabled={pendingAction === "password" || !currentPassword || !newPassword || !confirmPassword}
          className="mt-5 inline-flex h-12 items-center justify-center gap-2 bg-[#564FFD] px-6 text-base font-semibold tracking-[-0.128px] text-white transition hover:bg-[#453FCA] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pendingAction === "password" ? <Loader2 className="size-4 animate-spin" /> : null}
          Change Password
        </button>
        {passwordMessage ? <p className="mt-3 text-sm leading-6 text-[#6E7485]">{passwordMessage}</p> : null}
      </section>
    </div>
  );
}
