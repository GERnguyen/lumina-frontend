import { CoursesFooter } from "@/components/courses/CoursesFooter";
import type { UserProfilePurchaseHistoryData } from "@/data/user-profile";
import { UserProfileHero } from "./UserProfileHero";
import { UserProfilePurchaseHistoryList } from "./UserProfilePurchaseHistoryList";
import { UserProfileTopNav } from "./UserProfileTopNav";

export function UserProfilePurchaseHistoryPage({
  purchaseHistoryPage,
}: {
  purchaseHistoryPage: UserProfilePurchaseHistoryData;
}) {
  return (
    <main className="min-h-screen bg-white">
      <UserProfileTopNav avatar={purchaseHistoryPage.user.avatar} />
      <UserProfileHero dashboard={purchaseHistoryPage} />

      <section className="px-6 py-10 lg:px-8">
        <div className="mx-auto max-w-[1320px]">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold tracking-normal text-[#1D2026]">Purchase History</h2>
          </div>

          <UserProfilePurchaseHistoryList purchases={purchaseHistoryPage.purchases} />

          <p className="mt-8 text-center text-sm tracking-normal text-[#1D2026]">Yay! You have seen all your purchase history.</p>
        </div>
      </section>

      <CoursesFooter />
    </main>
  );
}
