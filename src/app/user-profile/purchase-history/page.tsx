import type { Metadata } from "next";
import { UserProfilePurchaseHistoryPage } from "@/components/user-profile/UserProfilePurchaseHistoryPage";
import { UserApi } from "@/services/api/user-api";
import { OrderApi } from "@/services/api/enrollment-api";
import { CourseApi } from "@/services/api/course-api";
import { getProfileTabs, mockUserProfileDashboard, mockProfilePurchaseHistory } from "@/data/user-profile";
import {
  getProfileAvatar,
  money,
  moneyWithCurrency,
  formatPurchaseDate,
  paymentMethodLabel,
  maskedPaymentAccount,
  getCourseImage,
  getCourseRating,
  getCourseInstructorName,
} from "@/lib/format";

export const metadata: Metadata = {
  title: "Purchase History - Cinx",
  description: "Review your Cinx purchase history, order details, and payment information.",
  alternates: {
    canonical: "/user-profile/purchase-history",
  },
};

export default async function Page() {
  const [userRes, ordersRes] = await Promise.all([
    UserApi.getCurrentUser().catch(() => ({ data: undefined })),
    OrderApi.getOrders({ page: 1, size: 10, sort: '{"orderDate":"DESC"}' }).catch(() => ({ data: [] })),
  ]);

  const user = userRes.data;
  if (!user) {
    return (
      <UserProfilePurchaseHistoryPage
        purchaseHistoryPage={{
          user: mockUserProfileDashboard.user,
          tabs: getProfileTabs("Purchase History"),
          purchases: mockProfilePurchaseHistory,
        }}
      />
    );
  }

  const orders = ordersRes.data || [];
  const courseIdSet = new Set<string>();
  orders.forEach((order) => {
    order.items?.forEach((item) => {
      if (item.courseId) courseIdSet.add(item.courseId);
    });
  });
  const courseIds = Array.from(courseIdSet);

  let courses: any[] = [];
  if (courseIds.length) {
    const coursesRes = await CourseApi.getCoursesByIds(courseIds.join(",")).catch(() => ({ data: [] }));
    courses = coursesRes.data || [];
  }

  const mappedPurchases = orders.map((order, index) => {
    const itemCount = order.items?.length || 0;
    const paymentInfo = order.payment?.paymentInfo;

    const mappedCourses = (order.items || []).map((item, itemIndex) => {
      const course = courses.find((c) => c.id === item.courseId);
      const price = item.discountedPrice ?? item.price ?? course?.discountedPrice ?? course?.price;

      return {
        id: item.id || `${order.id || "order"}-${item.courseId || itemIndex}`,
        courseId: item.courseId || course?.id || `course-${itemIndex}`,
        title: item.title || course?.title || "Untitled course",
        image: course ? getCourseImage(course) : `/courses/course-0${(itemIndex % 8) + 1}.png`,
        rating: course ? getCourseRating(course.rating) : "No reviews yet",
        reviews: course?.enrollmentCount ? new Intl.NumberFormat("en-US").format(course.enrollmentCount) : "",
        instructor: course ? getCourseInstructorName(course) : "Cinx Instructor",
        price: typeof price === "number" ? money(price) : "Free",
      };
    });

    const total = Math.max(0, (order.totalPrice || 0) - (order.discounted || 0));

    return {
      id: order.id || `order-${index}`,
      purchasedAt: formatPurchaseDate(order.orderDate),
      summaryDate: formatPurchaseDate(order.orderDate),
      courseCount: itemCount,
      total: moneyWithCurrency(total),
      paymentMethod: paymentMethodLabel(order.paymentMethod),
      status: order.status || "PENDING",
      paymentName: "Cinx Learner",
      paymentAccount: maskedPaymentAccount(paymentInfo),
      paymentExpiry: undefined,
      courses: mappedCourses,
    };
  });

  const purchaseHistoryPage = {
    user: {
      name: user.name || "Cinx Learner",
      headline: user.role === "INSTRUCTOR" ? "Instructor on Cinx" : user.bio || "Lifelong learner on Cinx",
      avatar: getProfileAvatar(user),
    },
    tabs: getProfileTabs("Purchase History"),
    purchases: mappedPurchases.length ? mappedPurchases : mockProfilePurchaseHistory,
  };

  return <UserProfilePurchaseHistoryPage purchaseHistoryPage={purchaseHistoryPage} />;
}
