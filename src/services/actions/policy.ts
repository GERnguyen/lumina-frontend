"use server";

import { PolicyApi } from "@/services/api/policy-api";

export async function getPublishedPoliciesAction() {
  try {
    const res = await PolicyApi.getPublishedPolicies();
    return { success: true, data: res.data || [] };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to fetch policies" };
  }
}

export async function getPublishedPolicyBySlugAction(slug: string) {
  try {
    const res = await PolicyApi.getPublishedPolicyBySlug(slug);
    return { success: true, data: res.data || null };
  } catch (error: any) {
    return { success: false, error: error?.message || `Failed to fetch policy: ${slug}` };
  }
}
