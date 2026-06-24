import {
  BookOpen,
  Award,
  Clock,
  CreditCard,
  MessageSquare,
  Bell,
} from "lucide-react";
import type { ComponentType } from "react";

export function parseMetadata(metadata: any): any {
  if (!metadata) return {};
  if (typeof metadata === "string") {
    try {
      return JSON.parse(metadata);
    } catch {
      return {};
    }
  }
  return metadata;
}

export function mapNotificationUrl(n: any): string {
  const type = n.type || "";
  const metadata = parseMetadata(n.metadata);
  const referenceId = n.referenceId || "";

  switch (type) {
    case "COURSE_PUBLISHED":
    case "COURSE_CONTENT_PUBLISHED":
    case "COURSE_COMPLETED":
      return `/courses/${referenceId || metadata.courseId || ""}`;
      
    case "COURSE_APPROVAL_REQUESTED":
      return "/instructor/courses";
      
    case "CERTIFICATE_REQUESTED":
      return `/instructor/certificates?query=${referenceId || metadata.requestId || ""}`;
      
    case "CERTIFICATE_APPROVED":
      return n.actionUrl || metadata.certificateUrl || "/my-learning";
      
    case "DAILY_LEARNING_REMINDER":
      if (metadata.targetItemId || referenceId) {
        return `/learning/items/${referenceId || metadata.targetItemId}`;
      }
      return "/learning";
      
    case "PAYMENT_SUCCEEDED":
    case "ORDER_CREATED":
    case "ORDER_CANCELLED":
      return "/user-profile/purchase-history";
      
    case "COURSE_REVIEW_CREATED":
      return "/instructor/courses";
      
    case "COURSE_QUESTION_CREATED":
    case "COURSE_ANSWER_CREATED":
      if (metadata.courseId) {
        return `/courses/${metadata.courseId}/watch`;
      }
      return "/instructor/dashboard";
      
    default:
      return n.actionUrl || "#";
  }
}

interface NotificationDetails {
  icon: ComponentType<{ className?: string }>;
  color: string;
  displayTitle: string;
  displayMessage: string;
}

export function getNotificationHelper(n: any): NotificationDetails {
  const type = n.type || "";
  const metadata = parseMetadata(n.metadata);

  let icon: ComponentType<{ className?: string }> = Bell;
  let color = "bg-blue-50 border-blue-100 text-blue-600";
  let displayTitle = n.title || "Thông báo mới";
  let displayMessage = n.message || "";

  switch (type) {
    case "COURSE_PUBLISHED":
      icon = BookOpen;
      color = "bg-emerald-50 border-emerald-100 text-emerald-600";
      displayTitle = displayTitle || "Khóa học đã xuất bản";
      if (metadata.courseTitle) {
        displayMessage = `Khóa học "${metadata.courseTitle}" đã được duyệt và xuất bản thành công.`;
      }
      break;
    case "COURSE_CONTENT_PUBLISHED":
      icon = BookOpen;
      color = "bg-indigo-50 border-indigo-100 text-indigo-600";
      displayTitle = displayTitle || "Nội dung khóa học mới";
      if (metadata.courseTitle) {
        displayMessage = `Khóa học "${metadata.courseTitle}" có nội dung cập nhật mới.`;
      }
      break;
    case "COURSE_COMPLETED":
      icon = BookOpen;
      color = "bg-purple-50 border-purple-100 text-purple-600";
      displayTitle = displayTitle || "Hoàn thành khóa học";
      if (metadata.courseTitle) {
        displayMessage = `Chúc mừng bạn đã hoàn thành tất cả nội dung khóa học "${metadata.courseTitle}".`;
      }
      break;
    case "COURSE_APPROVAL_REQUESTED":
      icon = BookOpen;
      color = "bg-amber-50 border-amber-100 text-amber-600";
      displayTitle = displayTitle || "Yêu cầu duyệt khóa học";
      if (metadata.courseTitle) {
        displayMessage = `Khóa học "${metadata.courseTitle}" đang chờ bạn duyệt nội dung giáo trình.`;
      }
      break;
    case "CERTIFICATE_REQUESTED":
      icon = Award;
      color = "bg-amber-50 border-amber-100 text-amber-600";
      displayTitle = displayTitle || "Yêu cầu cấp chứng chỉ";
      if (metadata.courseTitle) {
        displayMessage = `Học viên đã hoàn thành khóa học "${metadata.courseTitle}" và gửi yêu cầu cấp chứng chỉ.`;
      }
      break;
    case "CERTIFICATE_APPROVED":
      icon = Award;
      color = "bg-emerald-50 border-emerald-100 text-emerald-600";
      displayTitle = displayTitle || "Chứng chỉ đã được duyệt";
      if (metadata.courseTitle) {
        displayMessage = `Yêu cầu cấp chứng chỉ cho khóa học "${metadata.courseTitle}" đã được giảng viên phê duyệt thành công.`;
      }
      break;
    case "DAILY_LEARNING_REMINDER":
      icon = Clock;
      color = "bg-sky-50 border-sky-100 text-sky-600";
      displayTitle = displayTitle || "Nhắc nhở học tập";
      if (metadata.goalType) {
        displayMessage = `Nhắc nhở hoàn thành mục tiêu học tập hàng ngày: mục tiêu ${metadata.goalType}.`;
      }
      break;
    case "PAYMENT_SUCCEEDED":
      icon = CreditCard;
      color = "bg-emerald-50 border-emerald-100 text-emerald-600";
      displayTitle = displayTitle || "Thanh toán thành công";
      if (metadata.orderId) {
        const priceStr = metadata.totalPrice ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(metadata.totalPrice) : "";
        displayMessage = `Thanh toán thành công đơn hàng ${metadata.orderId} ${priceStr ? 'với số tiền ' + priceStr : ''}.`;
      }
      break;
    case "ORDER_CREATED":
      icon = CreditCard;
      color = "bg-blue-50 border-blue-100 text-blue-600";
      displayTitle = displayTitle || "Đơn hàng đã tạo";
      if (metadata.orderId) {
        displayMessage = `Đơn hàng ${metadata.orderId} đã được khởi tạo thành công.`;
      }
      break;
    case "ORDER_CANCELLED":
      icon = CreditCard;
      color = "bg-red-50 border-red-100 text-red-600";
      displayTitle = displayTitle || "Đơn hàng đã hủy";
      if (metadata.orderId) {
        displayMessage = `Đơn hàng ${metadata.orderId} đã bị hủy bỏ.`;
      }
      break;
    case "COURSE_REVIEW_CREATED":
      icon = MessageSquare;
      color = "bg-indigo-50 border-indigo-100 text-[#5D5FEF]";
      displayTitle = displayTitle || "Đánh giá khóa học mới";
      if (metadata.courseTitle) {
        const ratingStr = metadata.rating ? `(${metadata.rating} sao)` : "";
        displayMessage = `Bạn nhận được đánh giá mới ${ratingStr} từ học viên cho khóa học "${metadata.courseTitle}".`;
      }
      break;
    case "COURSE_QUESTION_CREATED":
      icon = MessageSquare;
      color = "bg-pink-50 border-pink-100 text-pink-600";
      displayTitle = displayTitle || "Câu hỏi thảo luận mới";
      break;
    case "COURSE_ANSWER_CREATED":
      icon = MessageSquare;
      color = "bg-teal-50 border-teal-100 text-teal-600";
      displayTitle = displayTitle || "Phản hồi thảo luận mới";
      break;
  }

  return { icon, color, displayTitle, displayMessage };
}
