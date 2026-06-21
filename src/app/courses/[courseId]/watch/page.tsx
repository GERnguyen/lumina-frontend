import { redirect } from "next/navigation";

type WatchRedirectRouteProps = {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ lessonId?: string }>;
};

export default async function Page({ params, searchParams }: WatchRedirectRouteProps) {
  const { courseId } = await params;
  const { lessonId } = await searchParams;
  redirect(`/learning/${courseId}${lessonId ? `?lessonId=${lessonId}` : ""}`);
}
