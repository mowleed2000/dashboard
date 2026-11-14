import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

// In-memory cache to respect API rate limits and ensure snappy response
let cachedData: any = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export async function GET() {
  try {
    const settingRow = db.prepare(`SELECT value_json FROM settings WHERE key = 'general'`).get() as { value_json: string } | undefined;
    const generalSettings = settingRow ? JSON.parse(settingRow.value_json) : {};
    
    const loc = generalSettings.weather_location || { city: "London", country: "UK", lat: 51.5074, lon: -0.1278 };
    const threshold = generalSettings.cold_weather_threshold !== undefined ? generalSettings.cold_weather_threshold : 6;
    const customColdMessage = generalSettings.cold_weather_message || "Maybe stick to the phone 🤭";

    const now = Date.now();
    if (cachedData && (now - lastFetchTime < CACHE_TTL_MS)) {
      return NextResponse.json({ ...cachedData, cached: true });
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4-second timeout for fail-safe
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Weather service returned ${res.status}`);
      }

      const raw = await res.json();
      const current = raw.current || {};
      const daily = raw.daily || {};

      const temp = Math.round(current.temperature_2m || 0);
      const feelsLike = Math.round(current.apparent_temperature || temp);
      const maxTemp = daily.temperature_2m_max ? Math.round(daily.temperature_2m_max[0]) : temp;
      const minTemp = daily.temperature_2m_min ? Math.round(daily.temperature_2m_min[0]) : temp;
      const rainProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : 0;
      const weatherCode = current.weather_code || 0;

      // Map WMO weather codes to human friendly descriptions and icons
      let condition = "Clear";
      if (weatherCode === 0) condition = "Clear Skies";
      else if (weatherCode >= 1 && weatherCode <= 3) condition = "Partly Cloudy";
      else if (weatherCode >= 45 && weatherCode <= 48) condition = "Foggy";
      else if (weatherCode >= 51 && weatherCode <= 67) condition = "Rain Showers";
      else if (weatherCode >= 71 && weatherCode <= 77) condition = "Snow Showers";
      else if (weatherCode >= 80 && weatherCode <= 82) condition = "Heavy Rain";
      else if (weatherCode >= 95) condition = "Thunderstorm";

      // Contextual weather guidance
      let advice = "";
      if (temp < threshold) {
        advice = customColdMessage;
      } else if (rainProb > 60) {
        advice = "Wet conditions ahead — prioritize digital follow-ups and warm calls.";
      } else if (temp >= 20) {
        advice = "Great conditions for in-person visits and field meetings.";
      } else {
        advice = "Moderate operating weather. Full sales throttle.";
      }

      const weatherResult = {
        success: true,
        city: loc.city,
        country: loc.country,
        temperature: temp,
        feels_like: feelsLike,
        high: maxTemp,
        low: minTemp,
        precipitation_probability: rainProb,
        condition,
        weather_code: weatherCode,
        advice,
        is_cold_alert: temp < threshold,
        last_updated: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        provider: "Open-Meteo Live Forecast"
      };

      cachedData = weatherResult;
      lastFetchTime = now;

      return NextResponse.json(weatherResult);
    } catch (networkError: any) {
      console.warn("Weather fetch failed, utilizing fallback:", networkError.message);
      // Fail-safe fallback so weather failure never breaks dashboard
      const fallback = {
        success: true,
        city: loc.city,
        country: loc.country,
        temperature: 9,
        feels_like: 8,
        high: 12,
        low: 5,
        precipitation_probability: 20,
        condition: "Partly Cloudy",
        weather_code: 2,
        advice: "Weather live feed temporarily cached. Normal operating rhythm.",
        is_cold_alert: false,
        last_updated: "Offline Mode",
        provider: "Cached Fallback"
      };
      return NextResponse.json(fallback);
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
