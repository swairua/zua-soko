import OpenAI from "openai";

// Initialize OpenAI client with error handling
let openai: OpenAI | null = null;

try {
  openai = new OpenAI({
    apiKey:
      process.env.OPENAI_API_KEY || "sk-test-key-zuasoko-ai-integration-2024",
  });
} catch (error) {
  console.log("OpenAI client initialization failed, using demo data");
}

export interface CropRecommendation {
  cropName: string;
  variety: string;
  expectedYield: string;
  growthPeriod: string;
  plantingTips: string[];
  marketDemand: "high" | "medium" | "low";
  confidence: number;
}

export interface PriceRecommendation {
  recommendedPrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  marketFactors: string[];
  confidence: number;
  reasoning: string;
}

export interface WeatherAdvice {
  currentConditions: string;
  farmingAdvice: string[];
  nextWeekOutlook: string;
  risks: string[];
}

export class AIService {
  /**
   * Get crop recommendations based on location, season, and soil type
   */
  static async getCropRecommendations(
    location: string,
    season: string,
    soilType?: string,
    farmSize?: string,
  ): Promise<CropRecommendation[]> {
    // Return demo data if OpenAI client is not available
    if (!openai) {
      return this.getDemoCropRecommendations(location);
    }

    try {
      const prompt = `As an agricultural expert in Kenya, recommend 3-5 suitable crops for:
Location: ${location}
Season: ${season}
Soil Type: ${soilType || "mixed"}
Farm Size: ${farmSize || "small-scale"}

For each crop, provide:
1. Crop name and best variety for Kenya
2. Expected yield per acre
3. Growth period (months)
4. 3 key planting tips
5. Market demand level
6. Confidence score (0-100)

Format as JSON array with fields: cropName, variety, expectedYield, growthPeriod, plantingTips, marketDemand, confidence`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("No AI response");

      // Try to parse JSON, fallback to demo data if failed
      try {
        return JSON.parse(content);
      } catch {
        return this.getDemoCropRecommendations(location);
      }
    } catch (error) {
      console.error("AI Service Error:", error);
      return this.getDemoCropRecommendations(location);
    }
  }

  /**
   * Get AI-powered price recommendations
   */
  static async getPriceRecommendation(
    cropType: string,
    quality: string,
    quantity: number,
    location: string,
  ): Promise<PriceRecommendation> {
    // Return demo data if OpenAI client is not available
    if (!openai) {
      return this.getDemoPriceRecommendation(cropType);
    }

    try {
      const prompt = `As a Kenyan agricultural market expert, recommend pricing for:
Crop: ${cropType}
Quality: ${quality}
Quantity: ${quantity} kg
Location: ${location}

Consider:
- Current Kenyan market prices
- Seasonal variations
- Transportation costs
- Quality grade impact
- Local demand

Provide:
1. Recommended price per kg (KES)
2. Price range (min-max KES)
3. 3 key market factors affecting price
4. Confidence score (0-100)
5. Brief reasoning

Format as JSON with fields: recommendedPrice, priceRange, marketFactors, confidence, reasoning`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("No AI response");

      try {
        return JSON.parse(content);
      } catch {
        return this.getDemoPriceRecommendation(cropType);
      }
    } catch (error) {
      console.error("AI Price Service Error:", error);
      return this.getDemoPriceRecommendation(cropType);
    }
  }

  /**
   * Get weather-based farming advice
   */
  static async getWeatherAdvice(location: string): Promise<WeatherAdvice> {
    // Return demo data if OpenAI client is not available
    if (!openai) {
      return this.getDemoWeatherAdvice();
    }

    try {
      const prompt = `As a farming advisor in Kenya, provide weather-based advice for ${location}:

Consider typical weather patterns for this region and season.
Provide:
1. Current weather conditions assessment
2. 3-4 specific farming activities to do now
3. Next week outlook for farmers
4. Weather-related risks to watch for

Format as JSON with fields: currentConditions, farmingAdvice, nextWeekOutlook, risks`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 600,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("No AI response");

      try {
        return JSON.parse(content);
      } catch {
        return this.getDemoWeatherAdvice();
      }
    } catch (error) {
      console.error("AI Weather Service Error:", error);
      return this.getDemoWeatherAdvice();
    }
  }

  /**
   * Get crop disease diagnosis from symptoms
   */
  static async diagnoseCropDisease(
    cropType: string,
    symptoms: string,
    imageDescription?: string,
  ): Promise<{
    disease: string;
    treatment: string[];
    prevention: string[];
    confidence: number;
  }> {
    // Return demo data if OpenAI client is not available
    if (!openai) {
      return {
        disease: "Common fungal infection",
        treatment: [
          "Apply fungicide",
          "Improve drainage",
          "Remove affected plants",
        ],
        prevention: ["Crop rotation", "Proper spacing", "Regular monitoring"],
        confidence: 75,
      };
    }

    try {
      const prompt = `As a plant pathologist in Kenya, diagnose this crop issue:
Crop: ${cropType}
Symptoms: ${symptoms}
${imageDescription ? `Image shows: ${imageDescription}` : ""}

Provide:
1. Most likely disease/pest
2. 3-4 treatment steps
3. 3 prevention measures
4. Confidence score (0-100)

Format as JSON with fields: disease, treatment, prevention, confidence`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("No AI response");

      try {
        return JSON.parse(content);
      } catch {
        return {
          disease: "Common fungal infection",
          treatment: [
            "Apply fungicide",
            "Improve drainage",
            "Remove affected plants",
          ],
          prevention: ["Crop rotation", "Proper spacing", "Regular monitoring"],
          confidence: 75,
        };
      }
    } catch (error) {
      console.error("AI Disease Service Error:", error);
      return {
        disease: "Unable to diagnose - consult local expert",
        treatment: [
          "Consult agricultural extension officer",
          "Take clear photos",
          "Monitor symptoms",
        ],
        prevention: [
          "Regular field inspection",
          "Good farm hygiene",
          "Proper nutrition",
        ],
        confidence: 50,
      };
    }
  }

  // Demo/fallback data methods
  private static getDemoCropRecommendations(
    location: string,
  ): CropRecommendation[] {
    return [
      {
        cropName: "Tomatoes",
        variety: "Anna F1",
        expectedYield: "15-20 tons per acre",
        growthPeriod: "3-4 months",
        plantingTips: [
          "Plant during dry season for better yield",
          "Ensure proper drainage",
          "Use certified seeds",
        ],
        marketDemand: "high",
        confidence: 85,
      },
      {
        cropName: "French Beans",
        variety: "Monel",
        expectedYield: "8-12 tons per acre",
        growthPeriod: "2-3 months",
        plantingTips: [
          "Plant in well-drained soil",
          "Regular watering needed",
          "Support with stakes",
        ],
        marketDemand: "high",
        confidence: 90,
      },
      {
        cropName: "Sukuma Wiki",
        variety: "Local variety",
        expectedYield: "10-15 tons per acre",
        growthPeriod: "1-2 months",
        plantingTips: [
          "Can grow year-round",
          "Harvest leaves regularly",
          "Rich soil preferred",
        ],
        marketDemand: "medium",
        confidence: 95,
      },
    ];
  }

  private static getDemoPriceRecommendation(
    cropType: string,
  ): PriceRecommendation {
    const basePrices: { [key: string]: number } = {
      tomatoes: 120,
      spinach: 50,
      carrots: 80,
      beans: 150,
      potatoes: 60,
    };

    const basePrice = basePrices[cropType.toLowerCase()] || 100;

    return {
      recommendedPrice: basePrice,
      priceRange: {
        min: Math.round(basePrice * 0.8),
        max: Math.round(basePrice * 1.3),
      },
      marketFactors: [
        "Seasonal demand is currently high",
        "Transportation costs affect final price",
        "Quality grade significantly impacts value",
      ],
      confidence: 78,
      reasoning: "Based on current market trends and seasonal demand patterns",
    };
  }

  private static getDemoWeatherAdvice(): WeatherAdvice {
    return {
      currentConditions:
        "Partly cloudy with occasional rainfall - good for most crops",
      farmingAdvice: [
        "Good time for planting leafy vegetables",
        "Ensure proper drainage in fields",
        "Monitor for pest activity after rains",
        "Apply organic fertilizer to crops",
      ],
      nextWeekOutlook:
        "Continued mixed weather with moderate rainfall expected",
      risks: [
        "Possible fungal diseases due to humidity",
        "Waterlogging in poorly drained areas",
      ],
    };
  }
}

export default AIService;
