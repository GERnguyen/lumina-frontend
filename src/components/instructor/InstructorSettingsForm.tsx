"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Check,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  Upload,
} from "lucide-react";
import type { UserDto } from "@/types";
import { changePasswordAction, updateProfileAction } from "@/services/actions/profile";
import { getProfileAvatar } from "@/lib/format";

type InstructorSettingsFormProps = {
  user: UserDto;
};

type FieldProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  right?: ReactNode;
  left?: ReactNode;
  reserveLabelSpace?: boolean;
  maxLength?: number;
};

function splitName(name?: string) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { firstName: parts[0] || "", lastName: "" };
  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts.at(-1) || "",
  };
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  right,
  left,
  reserveLabelSpace,
  maxLength,
}: FieldProps) {
  return (
    <label className="block min-w-0">
      {label ? <span className="mb-1.5 block text-sm leading-[22px] tracking-[-0.14px] text-[#1D2026]">{label}</span> : null}
      {!label && reserveLabelSpace ? <span className="mb-1.5 block text-sm leading-[22px] opacity-0">Label</span> : null}
      <span className="flex h-12 items-center rounded-[18px] border border-[#E9EAF0] bg-white px-4 transition focus-within:border-[#564FFD] focus-within:shadow-[0_0_0_3px_rgba(86,79,253,0.12)]">
        {left}
        <input
          value={value}
          onChange={(event) => onChange(maxLength ? event.target.value.slice(0, maxLength) : event.target.value)}
          placeholder={placeholder}
          type={type}
          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-base leading-6 text-[#1D2026] placeholder:text-[#8C94A3] focus:ring-0"
        />
        {right}
      </span>
    </label>
  );
}

function PasswordField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <Field
      label={label}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={isVisible ? "text" : "password"}
      right={(
        <button
          type="button"
          onClick={() => setIsVisible((current) => !current)}
          aria-label={isVisible ? "Hide password" : "Show password"}
          className="ml-3 text-[#4E5566] transition hover:text-[#564FFD]"
        >
          {isVisible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      )}
    />
  );
}

function SaveButton({ children, isLoading, disabled }: { children: string; isLoading?: boolean; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={isLoading || disabled}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-[18px] bg-[#564FFD] px-6 text-sm font-semibold capitalize tracking-[-0.128px] text-white transition hover:bg-[#453FCA] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

function SocialIcon({ type }: { type: "website" | "facebook" | "instagram" | "linkedin" | "twitter" | "whatsapp" | "youtube" }) {
  const className = "size-5 text-[#564FFD]";
  if (type === "website") return <Globe className={className} />;
  const labelMap = {
    facebook: "f",
    instagram: "ig",
    linkedin: "in",
    twitter: "x",
    whatsapp: "wa",
    youtube: "yt",
  } as const;

  return (
    <span className="flex size-5 items-center justify-center rounded-full bg-[#EBEBFF] text-[10px] font-bold uppercase text-[#564FFD]">
      {labelMap[type]}
    </span>
  );
}

function SocialPrefix({ type }: { type: "website" | "facebook" | "instagram" | "linkedin" | "twitter" | "whatsapp" | "youtube" }) {
  return (
    <span className="mr-3 flex items-center gap-3">
      <SocialIcon type={type} />
      <span className="h-8 w-px bg-[#E9EAF0]" />
    </span>
  );
}

function NotificationOption({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="sr-only" />
      <span className={`flex size-[18px] items-center justify-center rounded-full border transition ${checked ? "border-[#564FFD] bg-[#564FFD]" : "border-[#CED1D9] bg-white"}`}>
        {checked ? <Check className="size-3.5 text-white" /> : null}
      </span>
      <span className={`text-sm leading-[22px] tracking-[-0.14px] ${checked ? "text-[#1D2026]" : "text-[#6E7485]"}`}>{label}</span>
    </label>
  );
}

export function InstructorSettingsForm({ user }: InstructorSettingsFormProps) {
  const nameParts = useMemo(() => splitName(user.name), [user.name]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState(getProfileAvatar(user, "Lumina Instructor"));
  const [firstName, setFirstName] = useState(nameParts.firstName);
  const [lastName, setLastName] = useState(nameParts.lastName);
  const [username, setUsername] = useState(user.email?.split("@")[0] || "");
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || "");
  const [title, setTitle] = useState(user.role === "INSTRUCTOR" ? "Instructor on Lumina" : "");
  const [bio, setBio] = useState(user.bio || "");
  const [profileMessage, setProfileMessage] = useState("");
  const [socialMessage, setSocialMessage] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [pendingAction, setPendingAction] = useState<"profile" | "social" | "notifications" | "password" | undefined>();
  const [socials, setSocials] = useState({
    website: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    twitter: "",
    whatsapp: "",
    youtube: "",
  });
  const [notifications, setNotifications] = useState([
    false,
    true,
    false,
    true,
    true,
    Boolean(user.isReceivePushNotification),
    true,
  ]);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const fullName = [firstName, lastName].map((part) => part.trim()).filter(Boolean).join(" ");

  function setSocial(key: keyof typeof socials, value: string) {
    setSocials((current) => ({ ...current, [key]: value }));
  }

  function setNotification(index: number, value: boolean) {
    setNotifications((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileMessage("");
    setPendingAction("profile");

    try {
      if (!user.userId) throw new Error("User ID is missing.");
      const response = await updateProfileAction(user.userId, {
        name: fullName,
        phoneNumber,
        bio: bio || title,
        isReceivePushNotification: notifications[5],
      });
      if (!response.success) throw new Error(response.error);
      setProfileMessage("Profile updated successfully.");
    } catch (error) {
      setProfileMessage(error instanceof Error ? error.message : "Could not save profile.");
    } finally {
      setPendingAction(undefined);
    }
  }

  async function saveNotifications(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotificationMessage("");
    setPendingAction("notifications");

    try {
      if (!user.userId) throw new Error("User ID is missing.");
      const response = await updateProfileAction(user.userId, {
        name: fullName || user.name || "Lumina Instructor",
        phoneNumber,
        bio,
        isReceivePushNotification: notifications.some(Boolean),
      });
      if (!response.success) throw new Error(response.error);
      setNotificationMessage("Notification preferences updated.");
    } catch (error) {
      setNotificationMessage(error instanceof Error ? error.message : "Could not save notifications.");
    } finally {
      setPendingAction(undefined);
    }
  }

  function saveSocial(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPendingAction("social");
    setSocialMessage("Social links are saved in this session. Backend fields are not available yet.");
    window.setTimeout(() => setPendingAction(undefined), 250);
  }

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordMessage("");

    if (newPassword !== confirmPassword) {
      setPasswordMessage("New password and confirmation do not match.");
      return;
    }

    setPendingAction("password");
    try {
      const response = await changePasswordAction({
        email: user.email || "",
        oldPassword: currentPassword,
        newPassword,
      });
      if (!response.success) throw new Error(response.error);
      setPasswordMessage("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordMessage(error instanceof Error ? error.message : "Could not change password.");
    } finally {
      setPendingAction(undefined);
    }
  }

  function previewAvatar(file?: File) {
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setProfileMessage("Photo preview updated. Upload storage will be connected when avatar upload flow is ready.");
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={(event) => void saveProfile(event)} className="rounded-none bg-white p-6 sm:p-10">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-semibold leading-8 tracking-[-0.24px] text-[#1D2026]">Account Settings</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="Full name" value={firstName} onChange={setFirstName} placeholder="First name" />
              <Field value={lastName} onChange={setLastName} placeholder="Last name" reserveLabelSpace />
            </div>
            <div className="mt-5 space-y-5">
              <Field label="Username" value={username} onChange={setUsername} placeholder="Enter your username" />
              <Field
                label="Phone Number"
                value={phoneNumber}
                onChange={setPhoneNumber}
                placeholder="Your phone number..."
                left={<span className="mr-3 border-r border-[#E9EAF0] pr-3 text-base font-medium text-[#564FFD]">+84</span>}
              />
              <Field
                label="Title"
                value={title}
                onChange={setTitle}
                placeholder="Your title, profession or small biography"
                maxLength={50}
                right={<span className="ml-3 text-sm text-[#4E5566]">{title.length}/50</span>}
              />
              <label className="block">
                <span className="mb-1.5 block text-sm leading-[22px] tracking-[-0.14px] text-[#1D2026]">Biography</span>
                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  placeholder="Your title, profession or small biography"
                  className="h-[120px] w-full resize-none rounded-[18px] border border-[#E9EAF0] bg-white px-4 py-3 text-base leading-6 text-[#1D2026] placeholder:text-[#8C94A3] focus:border-[#564FFD] focus:ring-[#564FFD]/20"
                />
              </label>
            </div>
          </div>

          <div className="rounded-[18px] bg-[#F5F7FA] p-8">
            <div className="relative size-[200px] overflow-hidden rounded-[18px] bg-[#E9EAF0]">
              <Image src={avatarPreview} alt={user.name || "Instructor"} fill sizes="200px" className="object-cover" unoptimized={avatarPreview.startsWith("blob:")} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-x-0 bottom-0 flex h-12 items-center justify-center gap-2 bg-black/55 text-sm font-medium tracking-[-0.14px] text-white transition hover:bg-black/70"
              >
                <Upload className="size-5" />
                Upload Photo
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => previewAvatar(event.target.files?.[0])} />
            </div>
            <p className="mt-4 w-[200px] text-center text-xs leading-4 text-[#6E7485]">
              Image size should be under 1MB and image ratio needs to be 1:1.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <SaveButton isLoading={pendingAction === "profile"} disabled={!user.userId || !fullName}>Save Changes</SaveButton>
          {profileMessage ? <p className="text-sm text-[#6E7485]">{profileMessage}</p> : null}
        </div>
      </form>

      <form onSubmit={saveSocial} className="bg-white p-6 sm:p-10">
        <h2 className="text-2xl font-semibold leading-8 tracking-[-0.24px] text-[#1D2026]">Social Profile</h2>
        <div className="mt-6">
          <Field label="Personal Website" value={socials.website} onChange={(value) => setSocial("website", value)} placeholder="Personal website or portfolio url..." left={<SocialPrefix type="website" />} />
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <Field label="Facebook" value={socials.facebook} onChange={(value) => setSocial("facebook", value)} placeholder="Username" left={<SocialPrefix type="facebook" />} />
          <Field label="Instagram" value={socials.instagram} onChange={(value) => setSocial("instagram", value)} placeholder="Username" left={<SocialPrefix type="instagram" />} />
          <Field label="LinkedIn" value={socials.linkedin} onChange={(value) => setSocial("linkedin", value)} placeholder="Username" left={<SocialPrefix type="linkedin" />} />
          <Field label="Twitter" value={socials.twitter} onChange={(value) => setSocial("twitter", value)} placeholder="Username" left={<SocialPrefix type="twitter" />} />
          <Field label="Whatsapp" value={socials.whatsapp} onChange={(value) => setSocial("whatsapp", value)} placeholder="Phone number" left={<SocialPrefix type="whatsapp" />} />
          <Field label="Youtube" value={socials.youtube} onChange={(value) => setSocial("youtube", value)} placeholder="Username" left={<SocialPrefix type="youtube" />} />
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <SaveButton isLoading={pendingAction === "social"}>Save Changes</SaveButton>
          {socialMessage ? <p className="text-sm text-[#6E7485]">{socialMessage}</p> : null}
        </div>
      </form>

      <div className="grid gap-6 xl:grid-cols-2">
        <form onSubmit={(event) => void saveNotifications(event)} className="bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-semibold leading-8 tracking-[-0.24px] text-[#1D2026]">Notifications</h2>
          <div className="mt-6 space-y-4">
            {[
              "I want to know who buys my course.",
              "I want to know who writes a review on my course.",
              "I want to know who commented on my lecture.",
              "I want to know who downloaded my lecture notes.",
              "I want to know who replied to my comment.",
              "I want to know daily how many people visited my profile.",
              "I want to know who downloaded my lecture attachment file.",
            ].map((label, index) => (
              <NotificationOption key={label} checked={notifications[index]} onChange={(value) => setNotification(index, value)} label={label} />
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <SaveButton isLoading={pendingAction === "notifications"} disabled={!user.userId}>Save Changes</SaveButton>
            {notificationMessage ? <p className="text-sm text-[#6E7485]">{notificationMessage}</p> : null}
          </div>
        </form>

        <form onSubmit={(event) => void changePassword(event)} className="bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-semibold leading-8 tracking-[-0.24px] text-[#1D2026]">Change password</h2>
          <div className="mt-6 space-y-5">
            <PasswordField label="Current Password" value={currentPassword} onChange={setCurrentPassword} placeholder="Password" />
            <PasswordField label="New Password" value={newPassword} onChange={setNewPassword} placeholder="Password" />
            <PasswordField label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Confirm new password" />
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <SaveButton isLoading={pendingAction === "password"} disabled={!currentPassword || !newPassword || !confirmPassword}>Save Changes</SaveButton>
            {passwordMessage ? <p className="text-sm text-[#6E7485]">{passwordMessage}</p> : null}
          </div>
        </form>
      </div>
    </div>
  );
}
