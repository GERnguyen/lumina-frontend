import type { Metadata } from "next";
import { UserProfilePurchaseHistoryPage } from "@/components/user-profile/UserProfilePurchaseHistoryPage";
import { getUserProfilePurchaseHistory } from "@/components/user-profile/profile-helpers";

export const metadata: Metadata = {
  title: "Purchase History - Lumina",
  description: "Review your Lumina purchase history, order details, and payment information.",
  alternates: {
    canonical: "/user-profile/purchase-history",
  },
};

export default async function Page() {
  const { purchaseHistoryPage } = await getUserProfilePurchaseHistory();

  return <UserProfilePurchaseHistoryPage purchaseHistoryPage={purchaseHistoryPage} />;
}
