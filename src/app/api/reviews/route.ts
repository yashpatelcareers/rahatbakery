import { NextResponse } from "next/server";
import { getEffectiveReviewsData } from "@/lib/server/reviews-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getEffectiveReviewsData();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      {
        placeName: "Rahat Bakers and Sweets",
        rating: 4.9,
        userRatingCount: 184,
        reviews: [],
        googleMapsUri:
          "https://maps.google.com/?q=Rahat+Bakers+and+Sweets+13919+Baltimore+Ave+Laurel+MD+20707",
        isConfigured: true,
      },
      { status: 200 }
    );
  }
}
