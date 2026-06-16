import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  PaymentRequest,
  PaymentResponse,
  VNPayIPNResponse,
} from "@/types";

export const PaymentApi = {
  async cancelPayment(params: { orderId: string; paymentMethod: string }): Promise<ApiResponse<PaymentResponse>> {
    return apiClient.put("/api/v1/payments/cancel", undefined, { params });
  },

  async requestMomoPayment(body: PaymentRequest): Promise<ApiResponse<string>> {
    return apiClient.post("/api/v1/payments", body);
  },

  async handleMoMoCallback(body: Record<string, string>): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post("/api/v1/payments/momo-callback", body);
  },

  async handleVNPayIPN(): Promise<VNPayIPNResponse> {
    return apiClient.get("/api/v1/payments/IPN", { auth: false });
  },
};
