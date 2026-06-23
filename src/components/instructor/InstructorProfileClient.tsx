"use client";

import React, { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Upload,
  User as UserIcon,
  XCircle,
} from "lucide-react";
import { uploadFileWithPresignedUrl } from "@/lib/presigned-upload";
import { changePasswordAction, updateProfileAction } from "@/services/actions/profile";
import { Button, Input } from "../ui/shared";
import { InstructorButton } from "../ui/shared/InstructorButton";
import { InstructorCard } from "../ui/shared/InstructorCard";

interface ProfileUser {
  id: string;
  name: string;
  email: string;
  username: string;
  bio: string;
  avatar: string;
}

interface InstructorProfileClientProps {
  user: ProfileUser;
}

export function InstructorProfileClient({ user }: InstructorProfileClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar);
  const [avatarFile, setAvatarFile] = useState<File | undefined>();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isProfilePending, startProfileTransition] = useTransition();
  const [isPasswordPending, startPasswordTransition] = useTransition();
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleAvatarChange = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setProfileError("Vui lòng chọn file hình ảnh (PNG, JPG...).");
      return;
    }
    if (file.size > 1024 * 1024) {
      setProfileError("Kích thước ảnh đại diện không vượt quá 1MB.");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setProfileSuccess("Đã chọn ảnh mới. Bấm Lưu thay đổi để hoàn tất.");
  };

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);

    if (!fullName.trim()) {
      setProfileError("Họ và tên không được để trống.");
      return;
    }

    startProfileTransition(async () => {
      try {
        let avatarFileKey: string | undefined;

        if (avatarFile) {
          avatarFileKey = await uploadFileWithPresignedUrl(avatarFile, {
            fallbackContentType: "image/jpeg",
            prepareError: "Không thể chuẩn bị tải lên ảnh đại diện.",
            uploadError: "Không thể tải lên ảnh đại diện.",
          });
        }

        const result = await updateProfileAction(user.id, {
          name: fullName.trim(),
          bio: bio.trim(),
          ...(avatarFileKey ? { avatarFileKey } : {}),
        });

        if (result.success) {
          setProfileSuccess("Cập nhật thông tin tài khoản thành công.");
          setAvatarFile(undefined);
          router.refresh();
        } else {
          setProfileError(result.error || "Không thể cập nhật thông tin tài khoản.");
        }
      } catch (err: unknown) {
        setProfileError(err instanceof Error ? err.message : "Có lỗi xảy ra trong quá trình cập nhật.");
      }
    });
  };

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Vui lòng điền đầy đủ các thông tin mật khẩu.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Mật khẩu mới và xác nhận mật khẩu mới không trùng khớp.");
      return;
    }

    startPasswordTransition(async () => {
      try {
        const result = await changePasswordAction({
          email: user.email,
          oldPassword: currentPassword,
          newPassword,
        });

        if (result.success) {
          setPasswordSuccess("Thay đổi mật khẩu thành công.");
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        } else {
          setPasswordError(result.error || "Thay đổi mật khẩu thất bại. Vui lòng thử lại.");
        }
      } catch (err: unknown) {
        setPasswordError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <InstructorCard bodyClassName="px-5 py-4 sm:px-6">
        <h2 className="text-xl font-bold text-gray-900">Quản lý tài khoản cá nhân</h2>
        <p className="mt-1 text-xs text-gray-500">Cập nhật hồ sơ giảng viên và cài đặt bảo mật mật khẩu.</p>
      </InstructorCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <InstructorCard
          title={
            <div className="-mx-6 flex items-center gap-2 border-b border-gray-100 px-6 pb-3 text-xs font-bold text-gray-900">
              <UserIcon className="size-4 text-primary-600" />
              <span>Ảnh đại diện</span>
            </div>
          }
        >
          <div className="flex flex-col items-center py-4">
            <div className="relative size-36 overflow-hidden rounded-full border border-gray-200 bg-gray-100 shadow-sm">
              <Image
                src={avatarPreview}
                alt={user.name}
                fill
                sizes="144px"
                className="object-cover"
                unoptimized={avatarPreview.startsWith("blob:")}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-x-0 bottom-0 flex h-10 cursor-pointer items-center justify-center gap-1 bg-black/60 text-[10px] font-bold tracking-wide text-white transition hover:bg-black/75"
              >
                <Upload className="size-3.5" />
                Đổi ảnh
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handleAvatarChange(event.target.files?.[0])}
              />
            </div>
            <p className="mt-4 max-w-[220px] text-center text-xs leading-relaxed text-gray-500">
              Hỗ trợ JPG, PNG. Dung lượng tối đa 1MB, tỷ lệ 1:1 được khuyến nghị.
            </p>
          </div>
        </InstructorCard>

        <div className="space-y-6 lg:col-span-2">
          <InstructorCard
            title={
              <div className="-mx-6 flex items-center gap-2 border-b border-gray-100 px-6 pb-3 text-xs font-bold text-gray-900">
                <UserIcon className="size-4 text-primary-600" />
                <span>Hồ sơ giảng viên</span>
              </div>
            }
          >
            <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
              <FeedbackMessage type="success" message={profileSuccess} />
              <FeedbackMessage type="error" message={profileError} />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Tên đăng nhập" value={user.username} readOnly className="bg-gray-50 text-gray-500" />
                <Input label="Email đăng ký" value={user.email} readOnly className="bg-gray-50 text-gray-500" />
              </div>

              <Input
                label="Họ và tên"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Nhập họ và tên đầy đủ..."
                required
                className="bg-gray-50"
              />

              <Input
                label="Tiêu đề nghề nghiệp / Chức danh"
                value={bio}
                onChange={(event) => setBio(event.target.value.slice(0, 50))}
                placeholder="Ví dụ: Giảng viên CNTT, Software Architect..."
                helperText={`${bio.length}/50 ký tự`}
                className="bg-gray-50"
              />

              <InstructorButton type="submit" variant="primary" loading={isProfilePending} disabled={!fullName.trim()}>
                Lưu thay đổi
              </InstructorButton>
            </form>
          </InstructorCard>

          <InstructorCard
            title={
              <div className="-mx-6 flex items-center gap-2 border-b border-gray-100 px-6 pb-3 text-xs font-bold text-gray-900">
                <Lock className="size-4 text-primary-600" />
                <span>Đổi mật khẩu</span>
              </div>
            }
          >
            <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
              <FeedbackMessage type="success" message={passwordSuccess} />
              <FeedbackMessage type="error" message={passwordError} />

              <Input
                label="Mật khẩu hiện tại"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="Nhập mật khẩu hiện tại..."
                className="bg-gray-50"
                rightIcon={
                  <PasswordToggle shown={showCurrentPassword} onClick={() => setShowCurrentPassword((value) => !value)} />
                }
              />

              <Input
                label="Mật khẩu mới"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Nhập mật khẩu mới..."
                className="bg-gray-50"
                rightIcon={<PasswordToggle shown={showNewPassword} onClick={() => setShowNewPassword((value) => !value)} />}
              />

              <Input
                label="Xác nhận mật khẩu mới"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Nhập lại mật khẩu mới..."
                className="bg-gray-50"
                rightIcon={
                  <PasswordToggle shown={showConfirmPassword} onClick={() => setShowConfirmPassword((value) => !value)} />
                }
              />

              <InstructorButton
                type="submit"
                variant="primary"
                loading={isPasswordPending}
                disabled={!currentPassword || !newPassword || !confirmPassword}
              >
                Thay đổi mật khẩu
              </InstructorButton>
            </form>
          </InstructorCard>
        </div>
      </div>
    </div>
  );
}

function FeedbackMessage({ type, message }: { type: "success" | "error"; message: string | null }) {
  if (!message) return null;
  const Icon = type === "success" ? CheckCircle2 : XCircle;
  const classes =
    type === "success"
      ? "border-emerald-100 bg-emerald-50 text-emerald-800"
      : "border-red-100 bg-red-50 text-red-800";
  const iconClasses = type === "success" ? "text-emerald-500" : "text-red-500";

  return (
    <div className={`flex items-start gap-2.5 rounded-lg border p-3.5 text-xs font-semibold ${classes}`}>
      <Icon className={`mt-0.5 size-4 shrink-0 ${iconClasses}`} />
      <div>{message}</div>
    </div>
  );
}

function PasswordToggle({ shown, onClick }: { shown: boolean; onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="size-7 text-gray-400 hover:text-gray-700"
      aria-label={shown ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
    >
      {shown ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
    </Button>
  );
}
