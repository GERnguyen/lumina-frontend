import axios from "axios";
import {
  AuthControllerService,
  PresignedUrlControllerService,
  type AuthRequestDto,
  type RegisterRequest,
} from "@/api/generated/auth";

export type LoginRequest = AuthRequestDto & {
  role: "USER" | "INSTRUCTOR" | "ADMIN";
};

export async function login(requestBody: LoginRequest) {
  const response = await AuthControllerService.login({ requestBody });

  if (!response.data?.accessToken || !response.data.refreshToken) {
    throw new Error(response.message || "Login failed");
  }

  return response.data;
}

export async function register(requestBody: RegisterRequest) {
  const response = await AuthControllerService.register({ requestBody });

  if (response.success === false) {
    throw new Error(response.message || "Registration failed");
  }

  return response;
}

export async function uploadInstructorCv(file: File) {
  const response = await PresignedUrlControllerService.getPresignedUrl({
    fileName: file.name,
    contentType: file.type || "application/pdf",
  });

  const presignedUrl = response.data?.presignedUrl;
  const fileKey = response.data?.fileKey;

  if (!presignedUrl || !fileKey) {
    throw new Error(response.message || "Could not prepare CV upload");
  }

  await axios.put(presignedUrl, file, {
    headers: {
      "Content-Type": file.type || "application/pdf",
    },
  });

  return fileKey;
}
