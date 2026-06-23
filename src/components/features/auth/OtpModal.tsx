"use client";

import { useState, useEffect, FormEvent } from "react";
import { X, RefreshCw, CheckCircle, Mail, AlertTriangle } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { AuthService } from "@/services";
import { getErrorMessage } from "@/lib/errors";

interface OtpModalProps {
  email: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export function OtpModal({
  email,
  isOpen,
  onClose,
  onSuccess,
  title = "Verify Your Account",
  description = "Please enter the 6-digit OTP code sent to your email to verify your account.",
}: OtpModalProps) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  // Timer countdown for resending OTP
  useEffect(() => {
    if (!isOpen) return;
    if (countdown <= 0) return;

    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown, isOpen]);

  // Reset states when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      setOtp("");
      setError(null);
      setSuccess(null);
      setCountdown(60);
      setVerified(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError("Please enter a valid OTP code.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await AuthService.verifyOtp({
        body: { email, otp: otp.trim() },
      });

      if (res.success === false) {
        throw new Error(res.message || "Invalid OTP code.");
      }

      setVerified(true);
      setSuccess("Account verified successfully! You can now log in.");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      const errMsg = getErrorMessage(err, "OTP verification failed. Please try again.");
      const isExpired = errMsg.toLowerCase().includes("expire") || errMsg.toLowerCase().includes("hết hạn");

      if (isExpired) {
        setError("OTP has expired. Automatically sending a new OTP code...");
        try {
          await AuthService.resendOtp({
            body: { email },
          });
          setSuccess("A new OTP code has been sent to your email. Please check and try again.");
          setCountdown(60);
          setOtp("");
        } catch (resendErr: any) {
          setError("OTP has expired, and we failed to send a new OTP. Please try clicking Resend OTP manually.");
        }
      } else {
        setError(errMsg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (countdown > 0) return;

    setResending(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await AuthService.resendOtp({
        body: { email },
      });

      if (res.success === false) {
        throw new Error(res.message || "Failed to resend OTP.");
      }

      setSuccess("A new OTP code has been sent to your email.");
      setCountdown(60);
    } catch (err: any) {
      setError(getErrorMessage(err, "Failed to send OTP code. Please try again."));
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity duration-300">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl transition-all sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#F4F3FF] text-[#564FFD]">
              <Mail className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900">{title}</h2>
              <p className="text-xs text-zinc-500">{email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Description */}
        <p className="mt-4 text-sm text-zinc-600 leading-relaxed">
          {description}
        </p>

        {/* Feedback Messages */}
        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-danger-200 bg-danger-50 p-3 text-xs text-danger-700">
            <AlertTriangle className="size-4 shrink-0 text-danger-600" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-success-200 bg-success-50 p-3 text-xs text-success-700">
            <CheckCircle className="size-4 shrink-0 text-success-600" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleVerify} className="mt-6 space-y-4">
          <Input
            id="otp-input"
            label="OTP Verification Code"
            placeholder="Enter verification code"
            type="text"
            required
            autoFocus
            maxLength={10}
            className="text-center font-mono tracking-widest text-lg"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <Button
            type="submit"
            loading={loading}
            className="w-full h-11"
            disabled={verified}
          >
            Verify and Complete
          </Button>
        </form>

        {/* Resend Action */}
        <div className="mt-6 text-center text-sm">
          <span className="text-zinc-500">Didn't receive code? </span>
          {countdown > 0 ? (
            <span className="font-semibold text-[#564FFD]">
              Resend in {countdown}s
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending || verified}
              className="inline-flex items-center gap-1 font-semibold text-[#564FFD] hover:text-[#433EE8] hover:underline transition cursor-pointer disabled:opacity-50"
            >
              {resending ? (
                <>
                  <RefreshCw className="size-3 animate-spin" />
                  Sending...
                </>
              ) : (
                "Resend OTP"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
