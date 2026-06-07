export type CourseFact = {
  label: string;
  value: string;
};

export type CurriculumLecture = {
  title: string;
  duration: string;
  preview?: boolean;
};

export type CurriculumSection = {
  title: string;
  lectures: string;
  duration: string;
  expanded?: boolean;
  items: CurriculumLecture[];
};

export type CourseInstructor = {
  name: string;
  role: string;
  avatar: string;
  rating: string;
  students: string;
  courses: string;
  bio: string;
};

export type CourseReview = {
  name: string;
  time: string;
  avatar: string;
  rating: number;
  text: string;
};

export type CourseDetail = {
  id: string;
  title: string;
  subtitle: string;
  overview?: string[];
  categoryTrail: string[];
  authors: string[];
  authorAvatar: string;
  rating: string;
  ratingCount: string;
  heroImage: string;
  price: string;
  originalPrice: string;
  discount: string;
  urgency: string;
  facts: CourseFact[];
  includes: string[];
  learnings: string[];
  audience: string[];
  requirements: string[];
  curriculumSummary: CourseFact[];
  curriculum: CurriculumSection[];
  instructors: CourseInstructor[];
  reviews: CourseReview[];
  ratingBreakdown: Array<{ label: string; value: string; percent: number }>;
};

export const courseDetail: CourseDetail = {
  id: "complete-website-responsive-design",
  categoryTrail: ["Development", "Web Development", "Webflow"],
  title: "Complete Website Responsive Design: from Figma to Webflow to Website Design",
  subtitle:
    "3 in 1 Course: Learn to design websites with Figma, build with Webflow, and make a living freelancing.",
  authors: ["Dianne Russell", "Kristin Watson"],
  authorAvatar: "/course-detail/avatar-author.png",
  rating: "4.8",
  ratingCount: "451,444",
  heroImage: "/course-detail/trailer.png",
  price: "$14.00",
  originalPrice: "$26.00",
  discount: "56% OFF",
  urgency: "2 days left at this price!",
  facts: [
    { label: "Course Duration", value: "6 Month" },
    { label: "Course Level", value: "Beginner and Intermediate" },
    { label: "Students Enrolled", value: "69,419,618" },
    { label: "Language", value: "Mandarin" },
    { label: "Subtitle Language", value: "English" },
  ],
  includes: [
    "Lifetime access",
    "30-days money-back guarantee",
    "Free exercises file and downloadable resources",
    "Shareable certificate of completion",
    "Access on mobile, tablet and TV",
    "English subtitles",
    "100% online course",
  ],
  learnings: [
    "You will learn how to design beautiful websites using Figma, an interface design tool used by designers at Uber, Airbnb and Microsoft.",
    "You will learn secret tips of freelance web designers and how they make great money freelancing online.",
    "Understand how to use both the Jupyter Notebook and create .py files.",
    "You will learn how to take your designs and build them into powerful websites using Webflow.",
    "Learn to use Python professionally, learning both Python 2 and Python 3.",
    "Get an understanding of how to create GUIs in the Jupyter Notebook system.",
  ],
  audience: [
    "This course is for those who want to launch a freelance web design career.",
    "Present eget consequat elit. Duis a pretium purus.",
    "Sed sagittis suscipit condimentum pellentesque vulputate feugiat libero nec accumsan.",
    "Sed nec dapibus orci integer nisl turpis, eleifend sit amet aliquam vel, lacinia quis ex.",
    "Those who are looking to reboot their work life and try a new profession that is fun, rewarding and highly in demand.",
    "Nunc auctor consequat lorem, in posuere enim hendrerit sed.",
  ],
  requirements: [
    "Nunc auctor consequat lorem, in posuere enim hendrerit sed.",
    "Sed sagittis suscipit condimentum pellentesque vulputate feugiat libero nec accumsan.",
    "Duis ornare enim ullamcorper congue consectetur suspendisse interdum tristique est sed molestie.",
    "Those who are looking to reboot their work life and try a new profession that is fun, rewarding and highly in demand.",
    "Present eget consequat elit. Duis a pretium purus.",
    "Sed nec dapibus orci integer nisl turpis, eleifend sit amet aliquam vel, lacinia quis ex.",
    "This course is for those who want to launch a freelance web design career.",
  ],
  curriculumSummary: [
    { label: "Sections", value: "6" },
    { label: "Lectures", value: "202" },
    { label: "Duration", value: "19h 37m" },
  ],
  curriculum: [
    {
      title: "Getting Started",
      lectures: "4 lectures",
      duration: "51m",
      expanded: true,
      items: [
        { title: "What's is Webflow?", duration: "07:31", preview: true },
        { title: "Sign up in Webflow", duration: "07:31", preview: true },
        { title: "Webflow Terms & Conditions", duration: "5.3 MB", preview: true },
        { title: "Teaser of Webflow", duration: "07:31", preview: true },
        { title: "Practice Project", duration: "5.3 MB", preview: true },
      ],
    },
    { title: "Secret of Good Design", lectures: "52 lectures", duration: "5h 49m", items: [] },
    { title: "Practice Design Like an Artist", lectures: "43 lectures", duration: "53m", items: [] },
    { title: "Web Development (webflow)", lectures: "137 lectures", duration: "10h 6m", items: [] },
    { title: "Secrets of Making Money Freelancing", lectures: "21 lectures", duration: "38m", items: [] },
    { title: "Advanced", lectures: "39 lectures", duration: "91m", items: [] },
  ],
  instructors: [
    {
      name: "Vako Shvili",
      role: "Web Designer and Best-Selling Instructor",
      avatar: "/course-detail/person-2.png",
      rating: "4.9",
      students: "236,568",
      courses: "09",
      bio:
        "One day Vako had enough with the 9 to 5 grind, or more like 9 to 9 in his case, and quit his job to build a life around design, teaching and freelancing.",
    },
    {
      name: "Nima Tahami",
      role: "Entrepreneur and Designer, Founder of ShiftRide",
      avatar: "/course-detail/person-1.png",
      rating: "4.6",
      students: "53,423",
      courses: "01",
      bio:
        "Nima is an entrepreneur and designer with a high passion for building products and scaling ideas online. He brings practical lessons from product design into each class.",
    },
  ],
  ratingBreakdown: [
    { label: "5 Star Rating", value: "75%", percent: 75 },
    { label: "4 Star Rating", value: "21%", percent: 21 },
    { label: "3 Star Rating", value: "3%", percent: 3 },
    { label: "2 Star Rating", value: "1%", percent: 1 },
    { label: "1 Star Rating", value: "< 1%", percent: 1 },
  ],
  reviews: [
    {
      name: "Guy Hawkins",
      time: "1 week ago",
      avatar: "/course-detail/person-3.png",
      rating: 5,
      text:
        "I appreciate the precise short videos. It makes each lesson easy to focus on. The instructor is very knowledgeable and shares useful design thinking.",
    },
    {
      name: "Dianne Russell",
      time: "51 mins ago",
      avatar: "/course-detail/person-4.png",
      rating: 5,
      text:
        "This course is just amazing. It has great course content, best practices, and useful real-world knowledge.",
    },
    {
      name: "Bessie Cooper",
      time: "6 hours ago",
      avatar: "/course-detail/person-5.png",
      rating: 5,
      text:
        "Webflow course was good. I covered design basics, tool fundamentals and responsive web pages. Thank you Vako.",
    },
    {
      name: "Eleanor Pena",
      time: "1 day ago",
      avatar: "/course-detail/person-6.png",
      rating: 5,
      text:
        "I appreciate the concise lesson flow. Each video is short enough to stay focused and still practical enough to apply immediately.",
    },
    {
      name: "Ralph Edwards",
      time: "2 days ago",
      avatar: "/course-detail/person-7.png",
      rating: 5,
      text:
        "Great course. I watched the whole course very descriptively and professionally. I learned a lot that I can apply now.",
    },
    {
      name: "Arlene McCoy",
      time: "1 week ago",
      avatar: "/course-detail/person-8.png",
      rating: 5,
      text:
        "This should be one of the best courses I ever made about UI/UX in Lumina. Highly recommend to those new to UI/UX.",
    },
  ],
};

export function getCourseDetailById(courseId: string) {
  return {
    ...courseDetail,
    id: courseId,
  };
}
