import { OpenAPI as AuthOpenAPI } from "@/api/generated/auth";
import { OpenAPI as CartOpenAPI } from "@/api/generated/cart";
import { OpenAPI as CourseOpenAPI } from "@/api/generated/course";
import { OpenAPI as EnrollmentOpenAPI } from "@/api/generated/enrollment";
import { OpenAPI as LearningOpenAPI } from "@/api/generated/learning";
import { OpenAPI as NotificationOpenAPI } from "@/api/generated/notification";
import { OpenAPI as PaymentOpenAPI } from "@/api/generated/payment";
import { OpenAPI as SocialOpenAPI } from "@/api/generated/social";
import { OpenAPI as UserOpenAPI } from "@/api/generated/user";
import { API_BASE_URL } from "@/lib/api-base";
import { readClientAuthSession } from "@/lib/auth-session";
import { useAuthStore } from "@/stores/auth-store";

export { API_BASE_URL };

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
    client.TOKEN = async () => {
      const storedToken = useAuthStore.getState().accessToken;
      if (storedToken) return storedToken;

      const session = await readClientAuthSession();
      if (session?.accessToken) {
        useAuthStore.getState().setAccessToken(session.accessToken);
      }

      return session?.accessToken || "";
    };
  }
}

configureOpenApiClients();
