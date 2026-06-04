import { OpenAPI as AuthOpenAPI } from "@/api/generated/auth";
import { OpenAPI as CartOpenAPI } from "@/api/generated/cart";
import { OpenAPI as CourseOpenAPI } from "@/api/generated/course";
import { OpenAPI as EnrollmentOpenAPI } from "@/api/generated/enrollment";
import { OpenAPI as LearningOpenAPI } from "@/api/generated/learning";
import { OpenAPI as NotificationOpenAPI } from "@/api/generated/notification";
import { OpenAPI as PaymentOpenAPI } from "@/api/generated/payment";
import { OpenAPI as SocialOpenAPI } from "@/api/generated/social";
import { OpenAPI as UserOpenAPI } from "@/api/generated/user";
import { useAuthStore } from "@/stores/auth-store";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "https://shiny.id.vn";

const openApiClients = [
  AuthOpenAPI,
  CartOpenAPI,
  CourseOpenAPI,
  EnrollmentOpenAPI,
  LearningOpenAPI,
  NotificationOpenAPI,
  PaymentOpenAPI,
  SocialOpenAPI,
  UserOpenAPI,
];

export function configureOpenApiClients() {
  for (const client of openApiClients) {
    client.BASE = API_BASE_URL;
    client.TOKEN = async () => useAuthStore.getState().accessToken || "";
  }
}

configureOpenApiClients();
