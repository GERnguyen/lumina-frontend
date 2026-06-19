import { CheckCircle2, MoveRight } from "lucide-react";
import type { CourseResponse } from "@/types";
import { splitDescription, getCourseCategory } from "@/lib/format";

export function CourseOverview({ course }: { course: CourseResponse }) {
  const category = getCourseCategory(course);
  const overviewParagraphs = course.description
    ? splitDescription(course.description)
    : [
        `${course.title || "This course"} is designed to help learners build practical skills in ${category}.`,
        "The curriculum is organized into focused lessons so learners can move from core concepts to applied practice with a clear learning path.",
      ];

  const learnings = [
    `Understand the core concepts behind ${course.title || "this course"} and apply them in practical exercises.`,
    "Work through a structured curriculum with clear lesson progression.",
    "Practice with examples that mirror real product and engineering workflows.",
    course.hasCertificate ? "Earn a certificate after completing the course requirements." : "Build confidence through self-paced learning.",
  ];

  const audience = [
    `Learners who want to grow in ${category}.`,
    "Students preparing for project work, internships, or portfolio-ready practice.",
    "Developers and creators who prefer structured, focused lessons.",
  ];

  const requirements = [
    "A laptop or desktop with a stable internet connection.",
    "Basic familiarity with the course topic is helpful but not required.",
    "Curiosity and a willingness to practice after each lesson.",
  ];

  return (
    <section id="overview" className="space-y-10">
      <div>
        <h2 className="text-2xl font-semibold text-[#1D2026]">Description</h2>
        <div className="mt-4 space-y-4 text-sm leading-6 text-[#363B47]">
          {overviewParagraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>

      <div className="rounded-[18px] bg-[#EAF7EE] px-8 py-7">
        <h2 className="text-2xl font-semibold text-[#1D2026]">What you will learn in this course</h2>
        <div className="mt-5 grid gap-x-10 gap-y-4 md:grid-cols-2">
          {learnings.map((item) => (
            <div key={item} className="flex gap-3 text-sm leading-5 text-[#363B47]">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 fill-[#23BD33] text-white" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-[#1D2026]">Who this course is for:</h2>
        <ul className="mt-4 space-y-3">
          {audience.map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-5 text-[#363B47]">
              <MoveRight className="mt-0.5 size-4 shrink-0 text-[#7872FD]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-[#1D2026]">Course requirements</h2>
        <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-5 text-[#363B47]">
          {requirements.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
