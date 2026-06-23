import { type NextRequest } from "next/server";
import { getInstructorCoursesData, type InstructorCoursesFilters } from "@/services/actions/instructor";

function numberParam(value: string | null, fallback?: number) {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const filters: InstructorCoursesFilters = {
    page: numberParam(params.get("page"), 1) || 1,
    size: numberParam(params.get("size"), 12) || 12,
    query: params.get("query") || undefined,
    sort: params.get("sort") || '{"createdAt":"DESC"}',
    rating: numberParam(params.get("rating")),
    categoryId: params.get("categoryId") || undefined,
    status: params.get("status") || undefined,
  };

  return Response.json(await getInstructorCoursesData(filters));
}
