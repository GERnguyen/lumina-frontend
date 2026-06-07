import { CoursesFooter } from "@/components/courses/CoursesFooter";
import type { UserProfileWishlistData } from "@/data/user-profile";
import { UserProfileHero } from "./UserProfileHero";
import { UserProfileTopNav } from "./UserProfileTopNav";
import { UserProfileWishlistTable } from "./UserProfileWishlistTable";

export function UserProfileWishlistPage({ wishlistPage, isFallback }: { wishlistPage: UserProfileWishlistData; isFallback?: boolean }) {
  return (
    <main className="min-h-screen bg-white">
      <UserProfileTopNav avatar={wishlistPage.user.avatar} />
      <UserProfileHero dashboard={wishlistPage} />

      <section className="px-6 py-10 lg:px-8">
        <div className="mx-auto max-w-[1320px]">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold tracking-normal text-[#1D2026]">
              Wishlist <span className="font-normal">({wishlistPage.items.length})</span>
            </h2>
            {isFallback ? (
              <span className="rounded-full bg-[#FFF4E5] px-3 py-1 text-xs font-semibold text-[#B85C00]">
                Mock fallback
              </span>
            ) : null}
          </div>

          <UserProfileWishlistTable items={wishlistPage.items} />
        </div>
      </section>

      <CoursesFooter />
    </main>
  );
}
