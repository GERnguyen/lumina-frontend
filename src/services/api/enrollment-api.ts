import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  PaginatedApiResponse,
  CheckEnrollmentStatus,
  CourseResponse,
  CourseStatisticsResponse,
  CreateOrderRequest,
  CreateVoucherRequest,
  DashboardMetricsResponse,
  InstructorStatisticsResponse,
  OrderDetailResponse,
  OrderResponse,
  UpdateVoucherRequest,
  VoucherResponse,
} from "@/types";

// ── VoucherApi ──────────────────────────────────────────────
export const VoucherApi = {
  async getVoucherById(id: string): Promise<ApiResponse<VoucherResponse>> {
    return apiClient.get(`/api/v1/vouchers/${id}`);
  },

  async updateVoucher(id: string, body: UpdateVoucherRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.put(`/api/v1/vouchers/${id}`, body);
  },

  async deleteVoucher(id: string): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.delete(`/api/v1/vouchers/${id}`);
  },

  async getVouchers(params: {
    page?: number;
    size?: number;
    query?: string;
    sort?: string;
  }): Promise<PaginatedApiResponse<VoucherResponse>> {
    return apiClient.get("/api/v1/vouchers", { params });
  },

  async createVoucher(body: CreateVoucherRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post("/api/v1/vouchers", body);
  },

  async getVoucherByCode(code: string): Promise<ApiResponse<VoucherResponse>> {
    return apiClient.get("/api/v1/vouchers/code", { params: { code } });
  },
};

// ── OrderApi ──────────────────────────────────────────────
export const OrderApi = {
  async cancelOrder(orderId: string): Promise<ApiResponse<OrderDetailResponse>> {
    return apiClient.put(`/api/v1/orders/${orderId}/cancel`);
  },

  async getOrders(params: {
    page?: number;
    size?: number;
    query?: string;
    sort?: string;
  }): Promise<PaginatedApiResponse<OrderDetailResponse>> {
    return apiClient.get("/api/v1/orders", { params });
  },

  async createOrder(body: CreateOrderRequest): Promise<ApiResponse<OrderResponse>> {
    return apiClient.post("/api/v1/orders", body);
  },

  async getOrderById(orderId: string): Promise<ApiResponse<OrderDetailResponse>> {
    return apiClient.get(`/api/v1/orders/${orderId}`);
  },
};

// ── EnrollmentApi ──────────────────────────────────────────────
export const EnrollmentApi = {
  async checkEnrollmentStatus(body: string[]): Promise<ApiResponse<CheckEnrollmentStatus[]>> {
    return apiClient.post("/api/v1/enrollments/check", body);
  },

  async getEnrolledCourses(params: {
    page?: number;
    size?: number;
  }): Promise<PaginatedApiResponse<CourseResponse>> {
    return apiClient.get("/api/v1/enrollments", { params });
  },
};

// ── StatisticsApi ──────────────────────────────────────────────
export const StatisticsApi = {
  async getInstructorOverview(params: {
    groupBy?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<InstructorStatisticsResponse>> {
    return apiClient.get("/api/v1/statistics/instructor/overview", { params });
  },

  async getCourseStatisticsOverview(
    courseId: string,
    params: {
      groupBy?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<ApiResponse<CourseStatisticsResponse>> {
    return apiClient.get(`/api/v1/statistics/instructor/courses/${courseId}/overview`, { params });
  },

  async getDashboardMetrics(params: {
    year?: number;
    month?: number;
  }): Promise<ApiResponse<DashboardMetricsResponse>> {
    return apiClient.get("/api/v1/statistics/dashboard", { params });
  },
};
