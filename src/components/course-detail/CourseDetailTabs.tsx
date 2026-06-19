const tabs = ["Overview", "Curriculum", "Instructor", "Review"];

export function CourseDetailTabs() {
  return (
    <div className="overflow-hidden rounded-[18px] border border-[#E9EAF0] bg-white shadow-[0_10px_28px_rgba(29,32,38,0.05)]">
      <div className="grid grid-cols-4 text-center">
        {tabs.map((tab) => (
          <a
            key={tab}
            href={`#${tab.toLowerCase()}`}
            className="border-r border-[#E9EAF0] py-5 text-sm font-semibold text-[#1D2026] transition last:border-r-0 hover:bg-[#F8F8FF] hover:text-[#564FFD]"
          >
            {tab}
          </a>
        ))}
      </div>
    </div>
  );
}
