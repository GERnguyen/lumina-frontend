import Link from "next/link";
import { ArrowRight, Code2, Database, Layers3, Search, ShieldCheck, Star, UserRound } from "lucide-react";
import { CoursesFooter } from "@/components/courses/CoursesFooter";
import { CoursesTopNav } from "@/components/courses/CoursesTopNav";
import { CourseListingCard } from "@/components/courses/CourseListingCard";
import type { CategoryResponse, CourseResponse } from "@/types";

type HomeMarketplacePageProps = {
  featuredCourses: CourseResponse[];
  popularCourses: CourseResponse[];
  categories: CategoryResponse[];
};

const companyLogos = [
  { name: "Netflix", src: "/home/company/netflix.svg", className: "size-[58px]" },
  { name: "YouTube", src: "/home/company/youtube.svg", className: "h-8 w-[96px]" },
  { name: "Google", src: "/home/company/google.svg", className: "h-8 w-[98px]" },
  { name: "Lenovo", src: "/home/company/lenovo.svg", className: "size-[58px]" },
  { name: "Slack", src: "/home/company/slack.svg", className: "h-8 w-[96px]" },
  { name: "Verizon", src: "/home/company/verizon.svg", className: "size-[58px]" },
  { name: "Lexmark", src: "/home/company/lexmark.svg", className: "h-8 w-[104px]" },
  { name: "Microsoft", src: "/home/company/microsoft.svg", className: "h-8 w-[108px]" },
];

const fallbackCategories = [
  "Software Development",
  "Data Science",
  "Cybersecurity",
  "Cloud Computing",
  "Database Engineering",
  "AI Engineering",
];

const careerTracks = [
  {
    title: "Backend Developer",
    copy: "Build APIs, databases, and production services with project-based courses.",
    icon: Code2,
    href: "/courses?query=backend",
  },
  {
    title: "Data Analyst",
    copy: "Practice SQL, dashboards, and analytics workflows for real product teams.",
    icon: Database,
    href: "/courses?query=data",
  },
  {
    title: "Cloud Engineer",
    copy: "Learn deployment, infrastructure basics, and operations habits.",
    icon: Layers3,
    href: "/courses?query=cloud",
  },
  {
    title: "Security Starter",
    copy: "Understand secure systems, threat awareness, and defensive foundations.",
    icon: ShieldCheck,
    href: "/courses?query=security",
  },
];

const trendingSearches = ["Python", "Spring Boot", "React", "SQL", "Docker", "Cybersecurity", "Machine Learning", "AWS"];

export function HomeMarketplacePage({ featuredCourses, popularCourses, categories }: HomeMarketplacePageProps) {
  const displayCategories = categories.length ? categories.map((category) => category.name).filter(Boolean) as string[] : fallbackCategories;
  const primaryCourses = featuredCourses.length ? featuredCourses : popularCourses;
  const secondaryCourses = popularCourses.length ? popularCourses : featuredCourses;

  return (
    <main className="min-h-screen bg-[#FAFAFD] text-[#1D2026]">
      <CoursesTopNav />
      <HeroSection />
      <PartnerStrip />
      <FeaturedCourses courses={primaryCourses.slice(0, 4)} />
      <CareerTracks />
      <CategorySection categories={displayCategories.slice(0, 8)} />
      <PopularCourses courses={secondaryCourses.slice(0, 4)} />
      <TrendingSearches />
      <InstructorLandingSection />
      <CoursesFooter />
    </main>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 lg:block">
        <img
          src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&q=85"
          alt="Learners collaborating in a technology classroom"
          className="size-full object-cover"
          style={{ clipPath: "polygon(12% 0, 100% 0, 100% 100%, 0 100%)" }}
        />
      </div>

      <div className="mx-auto grid max-w-[1320px] gap-10 px-6 py-14 lg:min-h-[620px] lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:px-8 lg:py-20">
        <div className="relative z-10 flex flex-col justify-center">
          <h1 className="max-w-[760px] text-4xl font-semibold leading-[1.08] tracking-normal text-[#111033] md:text-5xl lg:text-6xl">
            Build job-ready tech skills with Lumina.
          </h1>
          <p className="mt-5 max-w-[620px] text-lg leading-8 text-[#4E5566]">
            Explore practical courses, follow career paths, and keep your learning momentum in one place.
          </p>

          <form action="/courses" className="mt-8 flex max-w-[680px] flex-col gap-3 rounded-[18px] border border-[#D8D6FF] bg-white p-2 shadow-[0_18px_48px_rgba(86,79,253,0.12)] sm:flex-row">
            <label className="flex h-14 min-w-0 flex-1 items-center gap-3 rounded-[14px] px-4">
              <Search className="size-5 shrink-0 text-[#6E7485]" />
              <input
                name="query"
                className="w-full border-0 p-0 text-base text-[#1D2026] placeholder:text-[#8C94A3] focus:ring-0"
                placeholder="What do you want to learn?"
              />
            </label>
            <button type="submit" className="inline-flex h-14 items-center justify-center rounded-[18px] bg-[#564FFD] px-7 text-base font-semibold text-white transition hover:bg-[#453FCA]">
              Search
            </button>
          </form>
        </div>

        <div className="relative lg:hidden">
          <img
            src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1100&q=85"
            alt="Learners collaborating in a technology classroom"
            className="aspect-[4/3] w-full rounded-[18px] object-cover"
          />
        </div>
      </div>
    </section>
  );
}

function PartnerStrip() {
  return (
    <section className="bg-[#FAFAFD] px-6 py-16 lg:px-8">
      <div className="mx-auto grid max-w-[1320px] gap-10 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-center">
        <div>
          <h2 className="text-[32px] font-semibold leading-10 tracking-normal text-[#1D2026]">6.3k trusted companies</h2>
          <p className="mt-5 max-w-[312px] text-sm leading-[22px] text-[#6E7485]">
            Learners use Lumina to build practical skills for modern software, data, cloud, and product teams.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {companyLogos.map((logo) => (
            <div key={logo.name} className="flex h-[84px] items-center justify-center rounded-[18px] bg-white px-8 shadow-[0_0_16px_rgba(9,26,68,0.07)] transition hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(9,26,68,0.10)]">
              <img src={logo.src} alt={`${logo.name} logo`} className={`${logo.className} object-contain`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedCourses({ courses }: { courses: CourseResponse[] }) {
  return (
    <section className="px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <SectionHeader
          title="New and popular"
          copy="Start with courses learners are exploring now."
          href="/courses"
          action="Explore courses"
        />
        <CourseGrid courses={courses} />
      </div>
    </section>
  );
}

function PopularCourses({ courses }: { courses: CourseResponse[] }) {
  if (!courses.length) return null;

  return (
    <section className="bg-white px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <SectionHeader
          title="Get job-ready for an in-demand role"
          copy="Pick a course that builds toward practical software and data work."
          href="/courses?sort=%7B%22enrollmentCount%22%3A%22DESC%22%7D"
          action="Browse programs"
        />
        <CourseGrid courses={courses} />
      </div>
    </section>
  );
}

function CourseGrid({ courses }: { courses: CourseResponse[] }) {
  if (!courses.length) {
    return (
      <div className="mt-8 rounded-[18px] border border-dashed border-[#D8D6FF] bg-white px-6 py-14 text-center">
        <p className="text-base font-semibold text-[#1D2026]">Courses are being prepared.</p>
        <p className="mt-2 text-sm text-[#6E7485]">Check back soon or browse the full catalog.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {courses.map((course, index) => (
        <CourseListingCard key={course.id || `${course.title}-${index}`} course={course} index={index} />
      ))}
    </div>
  );
}

function CareerTracks() {
  return (
    <section className="bg-[#111033] px-6 py-16 text-white lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <SectionHeader
          title="Explore career pathways"
          copy="Choose a target role and build the stack step by step."
          href="/courses"
          action="View all paths"
          dark
        />
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {careerTracks.map((track) => {
            const Icon = track.icon;
            return (
              <Link key={track.title} href={track.href} className="group rounded-[18px] border border-white/10 bg-white/[0.06] p-6 transition hover:-translate-y-1 hover:bg-white/[0.1]">
                <div className="flex size-12 items-center justify-center rounded-[18px] bg-[#7872FD] text-white">
                  <Icon className="size-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{track.title}</h3>
                <p className="mt-2 min-h-16 text-sm leading-6 text-white/70">{track.copy}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#BDB9FF]">
                  Start path
                  <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CategorySection({ categories }: { categories: string[] }) {
  return (
    <section className="px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <SectionHeader title="Explore categories" copy="Find courses by the skill area you want to strengthen." href="/courses" action="View catalog" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link key={category} href={`/courses?query=${encodeURIComponent(category)}`} className="group flex min-h-[116px] items-center justify-between rounded-[18px] border border-[#E9EAF0] bg-white p-5 transition hover:-translate-y-1 hover:border-[#D8D6FF] hover:shadow-[0_14px_30px_rgba(86,79,253,0.10)]">
              <span>
                <strong className="block text-base font-semibold text-[#1D2026]">{category}</strong>
                <span className="mt-2 block text-sm text-[#6E7485]">Courses and guided practice</span>
              </span>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#EBEBFF] text-[#564FFD] transition group-hover:bg-[#564FFD] group-hover:text-white">
                <ArrowRight className="size-5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrendingSearches() {
  return (
    <section className="px-6 pb-16 lg:px-8">
      <div className="mx-auto max-w-[1320px] rounded-[18px] bg-[#EBEBFF] p-8 lg:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[#111033]">Trending searches</h2>
            <p className="mt-2 text-sm leading-6 text-[#4E5566]">Jump into the topics learners are looking for right now.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {trendingSearches.map((term) => (
              <Link key={term} href={`/courses?query=${encodeURIComponent(term)}`} className="inline-flex h-10 items-center rounded-full bg-white px-4 text-sm font-semibold text-[#564FFD] transition hover:bg-[#564FFD] hover:text-white">
                {term}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const instructorCards = [
  {
    name: "Devon Lane",
    title: "Senior Developer",
    rating: "4.6",
    students: "854",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Darrell Steward",
    title: "Digital Product Designer",
    rating: "4.9",
    students: "451,444",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Jane Cooper",
    title: "UI/UX Designer",
    rating: "4.8",
    students: "435,671",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Albert Flores",
    title: "Adobe Instructor",
    rating: "4.7",
    students: "511,123",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Kathryn Murphy",
    title: "Lead Developer",
    rating: "4.2",
    students: "2,711",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
  },
];

function InstructorLandingSection() {
  return (
    <section className="bg-[#F5F7FA] px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-[18px] bg-gradient-to-r from-[#564FFD] to-[#7570F3] p-8 text-white lg:p-10">
            <div className="relative z-10 max-w-[340px]">
              <h2 className="text-[32px] font-semibold leading-10 tracking-normal">Become an instructor</h2>
              <p className="mt-3 text-sm leading-[22px] text-white/85">
                Share your expertise with learners and build courses around the skills you love teaching.
              </p>
              <Link href="/register" className="mt-6 inline-flex h-12 items-center justify-center gap-3 rounded-[18px] bg-white px-6 text-sm font-semibold text-[#564FFD] transition hover:bg-[#EBEBFF]">
                Start Teaching
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <img
              src="/home/cta/become-instructor.png"
              alt="Instructor pointing toward course setup"
              className="absolute bottom-0 right-3 hidden h-[96%] w-[45%] object-contain object-bottom md:block"
            />
          </div>

          <div className="rounded-[18px] bg-white p-8 lg:p-10">
            <h2 className="text-[28px] font-semibold leading-9 tracking-normal text-[#1D2026]">Your teaching & earning steps</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <TeachingStep number="1" text="Apply to become instructor" />
              <TeachingStep number="2" text="Build and edit your profile" />
              <TeachingStep number="3" text="Create your new course" />
              <TeachingStep number="4" text="Start teaching and earning" />
            </div>
          </div>
        </div>

        <div className="mt-16 rounded-[18px] border border-[#E9EAF0] bg-white p-8 lg:p-12">
          <h2 className="text-center text-[32px] font-semibold leading-10 tracking-normal text-[#1D2026] lg:text-[40px] lg:leading-[48px]">
            Top instructor of the month
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {instructorCards.map((instructor) => (
              <InstructorCard key={instructor.name} instructor={instructor} />
            ))}
          </div>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 text-center text-sm text-[#6E7485] sm:flex-row">
            <span>Thousands of students are waiting for an instructor.</span>
            <Link href="/register" className="inline-flex items-center gap-2 font-semibold text-[#564FFD]">
              Become Instructor
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function TeachingStep({ number, text }: { number: string; text: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-[#EBEBFF] text-2xl font-semibold text-[#564FFD]">
        {number}
      </span>
      <span className="text-base leading-6 text-[#1D2026]">{text}</span>
    </div>
  );
}

function InstructorCard({ instructor }: { instructor: (typeof instructorCards)[number] }) {
  return (
    <article className="group overflow-hidden rounded-[18px] border border-[#E9EAF0] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#D8D6FF] hover:shadow-[0_18px_36px_rgba(29,32,38,0.12)]">
      <img src={instructor.image} alt={instructor.name} className="aspect-square w-full object-cover" />
      <div className="p-4 text-center">
        <h3 className="text-base font-medium text-[#1D2026] transition group-hover:text-[#564FFD]">{instructor.name}</h3>
        <p className="mt-1 text-sm text-[#8C94A3]">{instructor.title}</p>
      </div>
      <div className="flex items-center justify-between border-t border-[#E9EAF0] px-4 py-3 text-sm">
        <span className="inline-flex items-center gap-1.5 font-medium text-[#4E5566]">
          <Star className="size-4 fill-[#564FFD] text-[#564FFD]" />
          {instructor.rating}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[#8C94A3]">
          <UserRound className="size-4 text-[#564FFD]" />
          <strong className="font-medium text-[#4E5566]">{instructor.students}</strong>
          students
        </span>
      </div>
    </article>
  );
}

function SectionHeader({ title, copy, href, action, dark }: { title: string; copy: string; href: string; action: string; dark?: boolean }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className={`text-3xl font-semibold tracking-normal ${dark ? "text-white" : "text-[#111033]"}`}>{title}</h2>
        <p className={`mt-2 max-w-[620px] text-base leading-7 ${dark ? "text-white/70" : "text-[#4E5566]"}`}>{copy}</p>
      </div>
      <Link href={href} className={`inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-[18px] px-5 text-sm font-semibold transition ${dark ? "bg-white text-[#111033] hover:bg-[#EBEBFF]" : "bg-[#EBEBFF] text-[#564FFD] hover:bg-[#DEDDFF]"}`}>
        {action}
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
