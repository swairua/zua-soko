"use client";

import { useState, useEffect } from "react";
import {
  Brain,
  Sprout,
  DollarSign,
  Cloud,
  Bug,
  TrendingUp,
  MapPin,
  Calendar,
  AlertTriangle,
  Lightbulb,
  Star,
  Loader,
} from "lucide-react";

interface CropRecommendation {
  cropName: string;
  variety: string;
  expectedYield: string;
  growthPeriod: string;
  plantingTips: string[];
  marketDemand: "high" | "medium" | "low";
  confidence: number;
}

interface PriceRecommendation {
  recommendedPrice: number;
  priceRange: { min: number; max: number };
  marketFactors: string[];
  confidence: number;
  reasoning: string;
}

interface WeatherAdvice {
  currentConditions: string;
  farmingAdvice: string[];
  nextWeekOutlook: string;
  risks: string[];
}

interface AIRecommendationsProps {
  farmerLocation?: string;
  currentSeason?: string;
}

export default function AIRecommendations({
  farmerLocation = "Kiambu",
  currentSeason = "Dry Season",
}: AIRecommendationsProps) {
  const [activeTab, setActiveTab] = useState<"crops" | "weather" | "pricing">(
    "crops",
  );
  const [cropRecommendations, setCropRecommendations] = useState<
    CropRecommendation[]
  >([]);
  const [weatherAdvice, setWeatherAdvice] = useState<WeatherAdvice | null>(
    null,
  );
  const [priceInsight, setPriceInsight] = useState<PriceRecommendation | null>(
    null,
  );
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  const fetchCropRecommendations = async () => {
    setLoading((prev) => ({ ...prev, crops: true }));
    const controller = new AbortController();

    try {
      const response = await fetch("/api/ai/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          type: "crop_recommendations",
          location: farmerLocation,
          season: currentSeason,
          soilType: "red soil",
          farmSize: "small-scale",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCropRecommendations(data.recommendations);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Failed to fetch crop recommendations:", error);
      }
    } finally {
      setLoading((prev) => ({ ...prev, crops: false }));
    }
  };

  const fetchWeatherAdvice = async () => {
    setLoading((prev) => ({ ...prev, weather: true }));
    const controller = new AbortController();

    try {
      const response = await fetch("/api/ai/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          type: "weather_advice",
          location: farmerLocation,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setWeatherAdvice(data.advice);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Failed to fetch weather advice:", error);
      }
    } finally {
      setLoading((prev) => ({ ...prev, weather: false }));
    }
  };

  const fetchPriceInsight = async () => {
    setLoading((prev) => ({ ...prev, pricing: true }));
    const controller = new AbortController();

    try {
      const response = await fetch("/api/ai/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          type: "price_recommendation",
          cropType: "tomatoes",
          quality: "Grade A",
          quantity: 100,
          location: farmerLocation,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPriceInsight(data.recommendation);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Failed to fetch price insight:", error);
      }
    } finally {
      setLoading((prev) => ({ ...prev, pricing: false }));
    }
  };

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!mounted) return;

      if (activeTab === "crops") {
        await fetchCropRecommendations();
      } else if (activeTab === "weather") {
        await fetchWeatherAdvice();
      } else if (activeTab === "pricing") {
        await fetchPriceInsight();
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [activeTab]);

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case "high":
        return "text-green-600 bg-green-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600";
    if (confidence >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-purple-100 rounded-lg mr-3">
          <Brain className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            AI Farm Assistant
          </h2>
          <p className="text-sm text-gray-600">
            <MapPin className="h-3 w-3 inline mr-1" />
            {farmerLocation} • {currentSeason}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab("crops")}
          className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "crops"
              ? "bg-white text-primary-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Sprout className="h-4 w-4 mr-2" />
          Crop Advice
        </button>
        <button
          onClick={() => setActiveTab("weather")}
          className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "weather"
              ? "bg-white text-primary-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Cloud className="h-4 w-4 mr-2" />
          Weather
        </button>
        <button
          onClick={() => setActiveTab("pricing")}
          className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "pricing"
              ? "bg-white text-primary-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <DollarSign className="h-4 w-4 mr-2" />
          Pricing
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[300px]">
        {/* Crop Recommendations Tab */}
        {activeTab === "crops" && (
          <div>
            {loading.crops ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="h-8 w-8 animate-spin text-primary-600" />
                <span className="ml-2 text-gray-600">
                  Getting crop recommendations...
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Recommended Crops for {currentSeason}
                </h3>
                {cropRecommendations.map((crop, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {crop.cropName}
                        </h4>
                        <p className="text-sm text-gray-600">{crop.variety}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getDemandColor(crop.marketDemand)}`}
                        >
                          {crop.marketDemand} demand
                        </span>
                        <span
                          className={`text-sm font-medium ${getConfidenceColor(crop.confidence)}`}
                        >
                          {crop.confidence}% confident
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                      <div>
                        <span className="text-gray-600">Expected Yield:</span>
                        <p className="font-medium">{crop.expectedYield}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Growth Period:</span>
                        <p className="font-medium">{crop.growthPeriod}</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-600 text-sm">Key Tips:</span>
                      <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                        {crop.plantingTips.map((tip, tipIndex) => (
                          <li key={tipIndex}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Weather Advice Tab */}
        {activeTab === "weather" && (
          <div>
            {loading.weather ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="h-8 w-8 animate-spin text-primary-600" />
                <span className="ml-2 text-gray-600">
                  Getting weather insights...
                </span>
              </div>
            ) : weatherAdvice ? (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2 flex items-center">
                    <Cloud className="h-5 w-5 mr-2" />
                    Current Conditions
                  </h3>
                  <p className="text-blue-800">
                    {weatherAdvice.currentConditions}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
                    Recommended Activities
                  </h3>
                  <ul className="space-y-2">
                    {weatherAdvice.farmingAdvice.map((advice, index) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full mt-2 mr-3"></span>
                        <span className="text-gray-700">{advice}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 mb-2 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Next Week Outlook
                  </h3>
                  <p className="text-green-800">
                    {weatherAdvice.nextWeekOutlook}
                  </p>
                </div>

                {weatherAdvice.risks.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-medium text-yellow-900 mb-2 flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Weather Risks
                    </h3>
                    <ul className="space-y-1">
                      {weatherAdvice.risks.map((risk, index) => (
                        <li key={index} className="text-yellow-800 text-sm">
                          • {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No weather data available
              </div>
            )}
          </div>
        )}

        {/* Price Insights Tab */}
        {activeTab === "pricing" && (
          <div>
            {loading.pricing ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="h-8 w-8 animate-spin text-primary-600" />
                <span className="ml-2 text-gray-600">
                  Analyzing market prices...
                </span>
              </div>
            ) : priceInsight ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    Market Price Analysis for Tomatoes
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Recommended Price</p>
                      <p className="text-2xl font-bold text-green-600">
                        KES {priceInsight.recommendedPrice}
                      </p>
                      <p className="text-xs text-gray-500">per kg</p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-600">Price Range</p>
                      <p className="text-lg font-semibold text-gray-700">
                        KES {priceInsight.priceRange.min} -{" "}
                        {priceInsight.priceRange.max}
                      </p>
                      <p className="text-xs text-gray-500">per kg</p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-600">Confidence</p>
                      <div className="flex items-center justify-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span
                          className={`font-semibold ${getConfidenceColor(priceInsight.confidence)}`}
                        >
                          {priceInsight.confidence}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Market Analysis:
                    </p>
                    <p className="text-gray-800 text-sm italic">
                      "{priceInsight.reasoning}"
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
                    Key Market Factors
                  </h3>
                  <div className="space-y-2">
                    {priceInsight.marketFactors.map((factor, index) => (
                      <div
                        key={index}
                        className="flex items-start bg-gray-50 rounded-lg p-3"
                      >
                        <span className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3"></span>
                        <span className="text-gray-700 text-sm">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No pricing data available
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
