import type { Metadata } from "next";
import { CoursesPage } from "@/components/courses/CoursesPage";
import type { CourseCatalogFilters } from "@/components/courses/CoursesPage";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Explore Lumina courses with filters for category, tools, rating, level, price, and duration.",
  alternates: {
    canonical: "/courses",
  },
};

type CoursesRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function numberParam(value: string | string[] | undefined) {
  const raw = firstParam(value);
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function sortParam(value: string | string[] | undefined) {
  const raw = firstParam(value);

  if (!raw || raw === "createdAt,desc") return '{"rating":"DESC"}';
  if (raw === "rating,desc") return '{"rating":"DESC"}';
  if (raw === "enrollmentCount,desc") return '{"enrollmentCount":"DESC"}';
  if (raw === "price,asc") return '{"discountedPrice":"ASC"}';
  if (raw === "price,desc") return '{"discountedPrice":"DESC"}';

  return raw;
}

export default async function Page({ searchParams }: CoursesRouteProps) {
  const params = await searchParams;
  const filters: CourseCatalogFilters = {
    page: numberParam(params.page) || 1,
    size: numberParam(params.size) || 9,
    query: firstParam(params.query),
    sort: sortParam(params.sort),
    rating: numberParam(params.rating),
    priceFrom: numberParam(params.priceFrom),
    priceTo: numberParam(params.priceTo),
    categoryId: firstParam(params.categoryId),
  };

  return <CoursesPage filters={filters} />;
}
