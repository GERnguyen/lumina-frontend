import type { Metadata } from "next";
import { UserProfileWishlistPage } from "@/components/user-profile/UserProfileWishlistPage";
import { getUserProfileWishlist } from "@/components/user-profile/profile-helpers";

export const metadata: Metadata = {
  title: "Wishlist - Lumina",
  description: "Review saved Lumina courses in your wishlist.",
  alternates: {
    canonical: "/user-profile/wishlist",
  },
};

export default async function Page() {
  const { wishlistPage } = await getUserProfileWishlist();

  return <UserProfileWishlistPage wishlistPage={wishlistPage} />;
}
