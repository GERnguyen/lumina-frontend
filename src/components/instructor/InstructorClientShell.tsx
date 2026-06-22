"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { InstructorDashboardPage } from "@/components/instructor/InstructorDashboardPage";
import { InstructorEarningPage } from "@/components/instructor/InstructorEarningPage";
import { InstructorFooter } from "@/components/instructor/InstructorDashboardWidgets";
import { InstructorSidebar } from "@/components/instructor/InstructorSidebar";
import { InstructorTopbar } from "@/components/instructor/InstructorTopbar";
import {
  getInstructorDashboardClientData,
  getInstructorEarningClientData,
  type InstructorRange,
} from "@/services/instructor-client-data";

const fallbackUser = {
  name: "Lumina Instructor",
  email: undefined,
  avatar: "https://ui-avatars.com/api/?name=Lumina%20Instructor&background=EBEBFF&color=564FFD&bold=true",
  role: "INSTRUCTOR" as const,
};

function parseRange(range?: string | null): InstructorRange {
  if (range === "7d" || range === "12m") return range;
  return "30d";
}

function InstructorLoadingShell({ activeItem, title }: { activeItem: "dashboard" | "earning"; title: string }) {
  return (
    <div className="instructor-shell min-h-screen bg-[#F5F7FA] text-[#1D2026]">
      <div className="flex min-h-screen">
        <InstructorSidebar activeItem={activeItem} />

        <main className="min-w-0 flex-1">
          <InstructorTopbar user={fallbackUser} title={title} />

          <div className="mx-auto flex w-full max-w-[1640px] flex-col gap-6 px-5 py-6 sm:px-8 2xl:px-40">
            <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="h-[136px] animate-pulse rounded-[18px] bg-white" />
              ))}
            </section>
            <div className="h-[360px] animate-pulse rounded-[18px] bg-white" />
            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
              <div className="h-[360px] animate-pulse rounded-[18px] bg-white" />
              <div className="h-[360px] animate-pulse rounded-[18px] bg-white" />
            </section>
            <InstructorFooter />
          </div>
        </main>
      </div>
    </div>
  );
}

function InstructorErrorShell({ activeItem, title, message }: { activeItem: "dashboard" | "earning"; title: string; message: string }) {
  return (
    <div className="instructor-shell min-h-screen bg-[#F5F7FA] text-[#1D2026]">
      <div className="flex min-h-screen">
        <InstructorSidebar activeItem={activeItem} />

        <main className="min-w-0 flex-1">
          <InstructorTopbar user={fallbackUser} title={title} />

          <div className="mx-auto flex w-full max-w-[900px] flex-col items-center justify-center px-5 py-24 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-[#FFF0F0] text-[#E34444]">
              <AlertCircle className="size-7" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-[#1D2026]">Could not load instructor data</h2>
            <p className="mt-2 max-w-[560px] text-sm leading-6 text-[#6E7485]">{message}</p>
          </div>
        </main>
      </div>
    </div>
  );
}

export function InstructorDashboardClientPage() {
  const router = useRouter();
  const query = useQuery({
    queryKey: ["instructor", "dashboard"],
    queryFn: getInstructorDashboardClientData,
  });

  useEffect(() => {
    if (query.data?.user.role && query.data.user.role !== "INSTRUCTOR") {
      router.replace("/courses");
    }
  }, [query.data?.user.role, router]);

  if (query.isLoading) return <InstructorLoadingShell activeItem="dashboard" title="Dashboard" />;
  if (query.isError || !query.data) {
    return <InstructorErrorShell activeItem="dashboard" title="Dashboard" message="Please sign in again or check whether the hosted backend is reachable." />;
  }

  return <InstructorDashboardPage data={query.data} />;
}

export function InstructorEarningClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const range = parseRange(searchParams.get("range"));
  const query = useQuery({
    queryKey: ["instructor", "earning", range],
    queryFn: () => getInstructorEarningClientData(range),
  });

  useEffect(() => {
    if (query.data?.user.role && query.data.user.role !== "INSTRUCTOR") {
      router.replace("/courses");
    }
  }, [query.data?.user.role, router]);

  if (query.isLoading) return <InstructorLoadingShell activeItem="earning" title="Earning" />;
  if (query.isError || !query.data) {
    return <InstructorErrorShell activeItem="earning" title="Earning" message="Revenue analytics could not be loaded from the hosted API right now." />;
  }

  return <InstructorEarningPage data={query.data} />;
}
