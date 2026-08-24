import { getReviewsConfigServer, getEffectiveReviewsData } from "@/lib/server/reviews-service";
import { ReviewsManager } from "@/components/admin/reviews-manager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Google Reviews & Social Proof | Rahat Bakery Admin",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminReviewsPage() {
  const config = await getReviewsConfigServer();
  const effectiveData = await getEffectiveReviewsData();

  const hasServerApiKey = Boolean(process.env.GOOGLE_PLACES_API_KEY);
  const hasServerPlaceId = Boolean(process.env.GOOGLE_PLACE_ID);

  return (
    <ReviewsManager
      initialConfig={config}
      effectiveData={effectiveData}
      hasServerApiKey={hasServerApiKey}
      hasServerPlaceId={hasServerPlaceId}
    />
  );
}
