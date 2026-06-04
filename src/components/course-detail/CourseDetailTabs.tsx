const tabs = ["Overview", "Curriculum", "Instructor", "Review"];

export function CourseDetailTabs() {
  return (
    <div className="border-b border-[#E9EAF0]">
      <div className="grid grid-cols-4 text-center">
        {tabs.map((tab) => (
          <a
            key={tab}
            href={`#${tab.toLowerCase()}`}
            className="relative py-5 text-sm font-medium text-[#4E5566] transition hover:text-[#7872FD]"
          >
            {tab}
            {tab === "Overview" ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#7872FD]" /> : null}
          </a>
        ))}
      </div>
    </div>
  );
}
