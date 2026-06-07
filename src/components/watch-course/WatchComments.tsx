import Image from "next/image";
import { MessageCircle } from "lucide-react";
import type { WatchComment, WatchCourseData } from "@/data/watch-course";

function CommentItem({ comment, nested = false }: { comment: WatchComment; nested?: boolean }) {
  return (
    <div className={nested ? "ml-12 border-l border-[#E9EAF0] pl-5" : ""}>
      <article className="flex gap-4 py-4">
        <Image src={comment.avatar} alt={comment.name} width={40} height={40} className="size-10 shrink-0 rounded-full object-cover" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-[#1D2026]">{comment.name}</h3>
            {comment.admin ? <span className="bg-[#7872FD] px-1.5 py-1 text-[10px] font-semibold uppercase leading-none text-white">Admin</span> : null}
            <span className="text-xs text-[#8C94A3]">•</span>
            <span className="text-xs text-[#8C94A3]">{comment.time}</span>
          </div>
          <p className="mt-2 text-sm leading-6 text-[#4E5566]">{comment.text}</p>
          <button type="button" className="mt-2 inline-flex items-center gap-2 text-xs font-semibold uppercase text-[#7872FD]">
            <MessageCircle className="size-4" />
            Reply
          </button>
        </div>
      </article>

      {comment.replies?.map((reply) => (
        <CommentItem key={`${reply.name}-${reply.time}`} comment={reply} nested />
      ))}
    </div>
  );
}

export function WatchComments({ course }: { course: WatchCourseData }) {
  return (
    <section id="comments">
      <h2 className="text-2xl font-semibold text-[#1D2026]">Comments ({course.commentsCount})</h2>
      <div className="mt-5">
        {course.comments.slice(0, 4).map((comment) => (
          <CommentItem key={`${comment.name}-${comment.time}`} comment={comment} />
        ))}

        <div className="ml-12 mt-2 flex gap-3">
          <label className="flex h-12 min-w-0 flex-1 items-center gap-3 border border-[#E9EAF0] px-4">
            <MessageCircle className="size-5 text-[#8C94A3]" />
            <span className="sr-only">Write your reply</span>
            <input className="w-full border-0 p-0 text-sm text-[#1D2026] placeholder:text-[#8C94A3] focus:ring-0" placeholder="Write your reply" />
          </label>
          <button type="button" className="h-12 rounded-[18px] bg-[#7872FD] px-6 text-sm font-semibold text-white">
            Post Reply
          </button>
        </div>

        {course.comments.slice(4).map((comment) => (
          <CommentItem key={`${comment.name}-${comment.time}`} comment={comment} />
        ))}
      </div>

      <button type="button" className="mt-4 h-12 rounded-[18px] bg-[#EBEBFF] px-6 text-sm font-semibold text-[#7872FD]">
        Load More
      </button>
    </section>
  );
}
