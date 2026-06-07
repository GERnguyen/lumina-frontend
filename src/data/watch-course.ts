export type WatchLecture = {
  id?: string;
  title: string;
  duration: string;
  status: "done" | "current" | "locked" | "next";
  type?: "VIDEO" | "ARTICLE" | "QUIZ" | "ASSIGNMENT";
};

export type WatchSection = {
  title: string;
  lectures: string;
  duration: string;
  progress?: string;
  expanded?: boolean;
  lessons: WatchLecture[];
};

export type WatchComment = {
  name: string;
  time: string;
  avatar: string;
  text: string;
  admin?: boolean;
  replies?: WatchComment[];
};

export type WatchCourseData = {
  courseId: string;
  lessonId?: string;
  courseTitle: string;
  currentLesson: string;
  lastUpdated: string;
  commentsCount: string;
  poster: string;
  videoUrl?: string;
  subtitles?: Array<{
    label: string;
    src: string;
    srcLang: string;
    default?: boolean;
  }>;
  stats: Array<{ label: string; value: string }>;
  tabs: Array<{ label: string; badge?: string }>;
  description: string[];
  notes: string[];
  attachment?: {
    name: string;
    size: string;
  };
  progress: string;
  progressPercent: number;
  sections: WatchSection[];
  comments: WatchComment[];
};

const commentText =
  "Nulla pellentesque leo vitae lorem hendrerit, sit amet elementum ipsum rutrum. Morbi ultricies volutpat orci quis fringilla.";

export function getWatchCourseData(courseId: string): WatchCourseData {
  return {
    courseId,
    lessonId: "mock-webflow-sign-up",
    courseTitle: "Complete Website Responsive Design: from Figma to Webflow to Website Design",
    currentLesson: "2. Sign up in Webflow",
    lastUpdated: "Oct 26, 2020",
    commentsCount: "154",
    poster: "/watch-course/video-poster.png",
    videoUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    stats: [
      { label: "Sections", value: "6" },
      { label: "Lectures", value: "202" },
      { label: "Duration", value: "19h 37m" },
    ],
    tabs: [
      { label: "Description" },
      { label: "Lectures Notes" },
      { label: "Attach File", badge: "01" },
      { label: "Comments" },
    ],
    description: [
      "We cover everything you need to build your first website. From creating your first page through to uploading your website to the internet. We will use the world's most popular and free web design tool called Visual Studio Code. There are exercise files you can download and then work along with me.",
      "If that all sounds a little too fancy, do not worry. This course is aimed at people new to web design and who have never coded before. We will start right at the beginning and work our way through step by step.",
    ],
    notes: [
      "In ut aliquet ante. Curabitur mollis tincidunt turpis, sed aliquam mauris finibus vel. Praesent eget mi in mi maximus egestas. Mauris eget ipsum in justo bibendum pellentesque.",
      "Nullam non quam a lectus finibus varius nec a orci. Aliquam efficitur sem cursus elit efficitur lacinia. Morbi sit amet pretium tellus. Donec blandit fermentum tincidunt.",
      "Donec congue aliquam lorem nec congue. Suspendisse eu risus mattis, interdum ante sed, fringilla urna. Praesent mattis dictum sapien a lacinia.",
    ],
    attachment: {
      name: "Create account on webflow.pdf",
      size: "12.6 MB",
    },
    progress: "15% Completed",
    progressPercent: 15,
    sections: [
      {
        title: "Getting Started",
        lectures: "4 lectures",
        duration: "51m",
        progress: "25% finish (1/4)",
        expanded: true,
        lessons: [
          { title: "1. What is Webflow?", duration: "07:31", status: "done" },
          { title: "2. Sign up in Webflow", duration: "07:31", status: "current" },
          { title: "3. Teaser of Webflow", duration: "07:31", status: "next" },
          { title: "4. Figma Introduction", duration: "07:31", status: "next" },
        ],
      },
      { title: "Secret of Good Design", lectures: "52 lectures", duration: "5m 49m", lessons: [] },
      { title: "Practice Design Like an Artist", lectures: "43 lectures", duration: "51m", lessons: [] },
      { title: "Web Development (webflow)", lectures: "137 lectures", duration: "10h 6m", lessons: [] },
      { title: "Secrets of Making Money Freelancing", lectures: "21 lectures", duration: "38m", lessons: [] },
      { title: "Advanced", lectures: "39 lectures", duration: "1h 31m", lessons: [] },
      { title: "What's Next", lectures: "7 lectures", duration: "1h 17m", lessons: [] },
    ],
    comments: [
      {
        name: "Ronald Richards",
        time: "1 week ago",
        avatar: "/course-detail/person-3.png",
        text: "Maecenas risus tortor, tincidunt nec purus eu, gravida suscipit tortor.",
        replies: [
          {
            name: "Kristin Watson",
            time: "1 week ago",
            avatar: "/course-detail/person-4.png",
            text: commentText,
            admin: true,
          },
          {
            name: "Cody Fisher",
            time: "1 week ago",
            avatar: "/course-detail/person-5.png",
            text: "Thank You so much sir, you are a great mentor.",
          },
        ],
      },
      {
        name: "Guy Hawkins",
        time: "2 weeks ago",
        avatar: "/course-detail/person-6.png",
        text: "Thank you for your helpful video. May I ask what app was used to demo the animation at 4:24?",
      },
      { name: "Esther Howard", time: "2 weeks ago", avatar: "/course-detail/person-7.png", text: "Quality content." },
      { name: "Theresa Webb", time: "3 weeks ago", avatar: "/course-detail/person-8.png", text: "Now I know that I will spend that 5 minutes of my life with pure pleasure." },
      { name: "Marvin McKinney", time: "3 weeks ago", avatar: "/course-detail/person-3.png", text: "Great tutorial. I am just wondering if this can be materialized in a real project." },
      { name: "Darrell Steward", time: "1 month ago", avatar: "/course-detail/person-4.png", text: "Awesome video. It opened the possibilities of designs and not be bounded by codes." },
      { name: "Floyd Miles", time: "1 month ago", avatar: "/course-detail/person-5.png", text: "I really hope you create more series like this UI and AE tutorials." },
      { name: "Courtney Henry", time: "1 month ago", avatar: "/course-detail/person-6.png", text: "Imagine seeing this while being a front end programmer." },
    ],
  };
}
