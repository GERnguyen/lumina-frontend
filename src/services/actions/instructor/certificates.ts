"use server";

import { CertificateApi } from "@/services/api/learning-api";
import { revalidatePath } from "next/cache";

export async function getInstructorCertificateRequests(params: {
  status?: string;
  page?: number;
  size?: number;
  query?: string;
  sort?: string;
}) {
  try {
    return await CertificateApi.getAllRequests(params);
  } catch (err) {
    console.error("Failed to fetch certificate requests:", err);
    return { data: [], meta: { totalElements: 0, totalPages: 1 } };
  }
}

export async function approveCertificateAction(requestId: string) {
  try {
    const res = await CertificateApi.approveCertificate(requestId);
    revalidatePath("/instructor/certificates");
    return { success: true, data: res.data };
  } catch (err: any) {
    console.error("Failed to approve certificate:", err);
    return { success: false, error: err?.message || "Failed to approve certificate" };
  }
}

export async function rejectCertificateAction(requestId: string) {
  try {
    const res = await CertificateApi.rejectCertificate(requestId);
    revalidatePath("/instructor/certificates");
    return { success: true, data: res.data };
  } catch (err: any) {
    console.error("Failed to reject certificate:", err);
    return { success: false, error: err?.message || "Failed to reject certificate" };
  }
}
