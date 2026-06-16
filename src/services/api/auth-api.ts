import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  AuthRequestDto,
  ChangePasswordRequest,
  OAuthRequest,
  RefreshTokenRequest,
  RegisterRequest,
  ResetPasswordRequest,
  SendOtpRequest,
  TokenResponseDto,
  VerifyEmailRequest,
} from "@/types";

export const AuthApi = {
  async verifyOtp(body: VerifyEmailRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post("/api/v1/auth/verify-otp", body, { auth: false });
  },

  async resendOtp(body: SendOtpRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post("/api/v1/auth/send-otp", body, { auth: false });
  },

  async resetPassword(body: ResetPasswordRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post("/api/v1/auth/reset-password", body, { auth: false });
  },

  async register(body: RegisterRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post("/api/v1/auth/register", body, { auth: false });
  },

  async refreshToken(body: RefreshTokenRequest): Promise<ApiResponse<TokenResponseDto>> {
    return apiClient.post("/api/v1/auth/refresh-token", body, { auth: false });
  },

  async login(body: AuthRequestDto): Promise<ApiResponse<TokenResponseDto>> {
    return apiClient.post("/api/v1/auth/login", body, { auth: false });
  },

  async loginWithGoogle(body: OAuthRequest): Promise<ApiResponse<TokenResponseDto>> {
    return apiClient.post("/api/v1/auth/login/google", body, { auth: false });
  },

  async changePassword(body: ChangePasswordRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post("/api/v1/auth/change-password", body);
  },
};
