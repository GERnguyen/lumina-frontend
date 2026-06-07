import { CheckCircle2, MoveRight } from "lucide-react";
import type { CourseDetail } from "@/data/course-detail";

const paragraphs = [
  "It gives you a huge self-satisfaction when you look at your work and say, I made this. I love that feeling after I finish working on something. When I leaned back in my chair, looked at the final result with a smile, and shared it with others, I felt especially satisfying when I knew I made $5,000.",
  "I did. And that is why I got into this field. Not for the love of Web Design, which I do now. But for the lifestyle. There are many ways one can achieve this lifestyle. This is my way. This is how I achieved a lifestyle I have been fantasizing about for five years.",
  "For example, this is a Design course but I do not teach you Photoshop. Because Photoshop is needlessly complicated for Web Design. But people still teach it to web designers. Why? I teach Figma, a simple tool that is taking over the design world.",
  "Second, this is a Development course. But I do not teach you how to code. Because for Web Design coding is needlessly complicated and takes too long to learn. Instead, I teach Webflow. You will be building complex websites within two weeks while others are still learning HTML and CSS.",
];

export function CourseOverview({ course }: { course: CourseDetail }) {
  const overviewParagraphs = course.overview?.length ? course.overview : paragraphs;

  return (
    <section id="overview" className="space-y-10">
      <div>
        <h2 className="text-2xl font-semibold text-[#1D2026]">Description</h2>
        <div className="mt-4 space-y-4 text-sm leading-6 text-[#4E5566]">
          {overviewParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>

      <div className="bg-[#EAF7EE] px-8 py-7">
        <h2 className="text-2xl font-semibold text-[#1D2026]">What you will learn in this course</h2>
        <div className="mt-5 grid gap-x-10 gap-y-4 md:grid-cols-2">
          {course.learnings.map((item) => (
            <div key={item} className="flex gap-3 text-sm leading-5 text-[#4E5566]">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 fill-[#23BD33] text-white" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-[#1D2026]">Who this course is for:</h2>
        <ul className="mt-4 space-y-3">
          {course.audience.map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-5 text-[#4E5566]">
              <MoveRight className="mt-0.5 size-4 shrink-0 text-[#7872FD]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-[#1D2026]">Course requirements</h2>
        <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-5 text-[#4E5566]">
          {course.requirements.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
