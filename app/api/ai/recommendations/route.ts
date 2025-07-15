import { NextRequest, NextResponse } from "next/server";
import AIService from "@/lib/ai-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      location,
      season,
      cropType,
      quality,
      quantity,
      symptoms,
      imageDescription,
    } = body;

    switch (type) {
      case "crop_recommendations":
        const cropRecs = await AIService.getCropRecommendations(
          location,
          season,
          body.soilType,
          body.farmSize,
        );
        return NextResponse.json({ recommendations: cropRecs });

      case "price_recommendation":
        const priceRec = await AIService.getPriceRecommendation(
          cropType,
          quality,
          quantity,
          location,
        );
        return NextResponse.json({ recommendation: priceRec });

      case "weather_advice":
        const weatherAdvice = await AIService.getWeatherAdvice(location);
        return NextResponse.json({ advice: weatherAdvice });

      case "disease_diagnosis":
        const diagnosis = await AIService.diagnoseCropDisease(
          cropType,
          symptoms,
          imageDescription,
        );
        return NextResponse.json({ diagnosis });

      default:
        return NextResponse.json(
          { error: "Invalid recommendation type" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("AI Recommendations API Error:", error);
    return NextResponse.json(
      { error: "Failed to get AI recommendations" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "AI Recommendations API",
    available_types: [
      "crop_recommendations",
      "price_recommendation",
      "weather_advice",
      "disease_diagnosis",
    ],
  });
}
