import { NextResponse } from "next/server";
import { getGoogleReviews } from "@/lib/server/google-reviews";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getGoogleReviews();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      {
        placeName: "Rahat Bakers and Sweets",
        rating: 0,
        userRatingCount: 0,
        reviews: [],
        googleMapsUri: "https://maps.google.com/?q=Rahat+Bakers+and+Sweets+13919+Baltimore+Ave+Laurel+MD+20707",
        isConfigured: false,
      },
      { status: 200 }
    );
  }
}
