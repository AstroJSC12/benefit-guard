/**
 * Provider Lookup Module
 *
 * Uses Google Places API (New) + Geocoding API to find real nearby
 * healthcare providers. Falls back to mock data when GOOGLE_PLACES_API_KEY
 * is not configured.
 *
 * Flow: zip code → geocode to lat/lng → Places Nearby Search → map to Provider[]
 *
 * Required env: GOOGLE_PLACES_API_KEY (enables both Places and Geocoding APIs)
 */

import { Provider } from "@/types";
import { enrichWithNpi } from "./nppes";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY || "";

// ─── Google Places type mapping ─────────────────────────
// Maps our app categories to Google Places "includedTypes"
// Only use types from the Google Places API (New) type list:
// https://developers.google.com/maps/documentation/places/web-service/place-types
// Only types validated to work with the searchNearby endpoint.
// "urgent_care" has no valid Nearby type — handled via Text Search instead.
const NEARBY_TYPE_MAP: Record<string, string[]> = {
  hospital: ["hospital"],
  clinic: ["doctor"],
  pharmacy: ["pharmacy"],
  dentist: ["dentist"],
};

// Search radius in meters (10 miles ≈ 16,093 meters)
const SEARCH_RADIUS_METERS = 16093;

// Max results to return per search
const MAX_RESULTS = 20;

// Simple in-memory cache for geocoded zip codes to avoid redundant API calls.
// Key: zip code, Value: { location, timestamp }.
const geocodeCache = new Map<string, { loc: GeoLocation; ts: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

// ─── Geocoding ──────────────────────────────────────────

export interface GeoLocation {
  lat: number;
  lng: number;
}

/**
 * Validate that input looks like a US zip code (5 digits, optionally +4).
 */
function isValidZip(zip: string): boolean {
  return /^\d{5}(-\d{4})?$/.test(zip.trim());
}

/**
 * Convert a zip code to lat/lng using Google Places Text Search.
 * This avoids needing the separate Geocoding API — only requires
 * the Places API (New) to be enabled.
 *
 * Results are cached in-memory to save API calls.
 */
export async function geocodeZip(zipCode: string): Promise<GeoLocation | null> {
  if (!API_KEY) return null;

  const trimmed = zipCode.trim().slice(0, 5);

  // Check cache first
  const cached = geocodeCache.get(trimmed);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.loc;
  }

  // Use Places Text Search to resolve "zip code 90210" to a location
  const url = "https://places.googleapis.com/v1/places:searchText";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "places.location",
      },
      body: JSON.stringify({
        textQuery: `${trimmed} zip code United States`,
        maxResultCount: 1,
      }),
    });

    const data = await res.json();

    if (data.error) {
      console.error("Places geocoding error:", data.error.message);
      return null;
    }

    const place = data.places?.[0];
    if (place?.location) {
      const loc: GeoLocation = {
        lat: place.location.latitude,
        lng: place.location.longitude,
      };
      geocodeCache.set(trimmed, { loc, ts: Date.now() });
      return loc;
    }

    console.error("No geocoding result for zip:", trimmed);
    return null;
  } catch (err) {
    console.error("Places geocoding request error:", err);
    return null;
  }
}

// ─── Google Places Nearby Search (New) ──────────────────

interface PlacesResult {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  rating?: number;
  userRatingCount?: number;
  currentOpeningHours?: { openNow?: boolean; weekdayDescriptions?: string[] };
  regularOpeningHours?: { openNow?: boolean; weekdayDescriptions?: string[] };
  googleMapsUri?: string;
  websiteUri?: string;
  location?: { latitude: number; longitude: number };
  types?: string[];
  /** Internal tag: true when result came from an urgent care text search */
  _isUrgentCare?: boolean;
}

const PLACES_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.rating",
  "places.userRatingCount",
  "places.currentOpeningHours",
  "places.regularOpeningHours",
  "places.googleMapsUri",
  "places.websiteUri",
  "places.location",
  "places.types",
].join(",");

/**
 * Search for nearby places using Google Places API (New) — Nearby Search.
 * Works for hospital, doctor, pharmacy, dentist types.
 */
async function searchNearbyPlaces(
  center: GeoLocation,
  includedTypes: string[]
): Promise<PlacesResult[]> {
  if (includedTypes.length === 0) return [];

  const url = "https://places.googleapis.com/v1/places:searchNearby";

  const body = {
    includedTypes,
    maxResultCount: MAX_RESULTS,
    locationRestriction: {
      circle: {
        center: { latitude: center.lat, longitude: center.lng },
        radius: SEARCH_RADIUS_METERS,
      },
    },
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": PLACES_FIELD_MASK,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (data.error) {
      console.error("Places Nearby error:", data.error.message);
      return [];
    }

    return data.places || [];
  } catch (err) {
    console.error("Places Nearby request error:", err);
    return [];
  }
}

/**
 * Text Search — used for "urgent care" since there is no valid
 * Nearby Search type for urgent care facilities.
 */
async function searchTextPlaces(
  query: string,
  center: GeoLocation
): Promise<PlacesResult[]> {
  const url = "https://places.googleapis.com/v1/places:searchText";

  const body = {
    textQuery: query,
    maxResultCount: MAX_RESULTS,
    locationBias: {
      circle: {
        center: { latitude: center.lat, longitude: center.lng },
        radius: SEARCH_RADIUS_METERS,
      },
    },
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": PLACES_FIELD_MASK,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (data.error) {
      console.error("Places Text Search error:", data.error.message);
      return [];
    }

    return data.places || [];
  } catch (err) {
    console.error("Places Text Search request error:", err);
    return [];
  }
}

// ─── Distance calculation ───────────────────────────────

/**
 * Haversine formula: calculate distance between two lat/lng points in miles.
 */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Determine our app's provider type from Google Places types array
 * and optionally the place name (for text search results that
 * lack structured type info).
 */
function classifyProviderType(
  googleTypes: string[],
  placeName?: string
): Provider["type"] {
  if (googleTypes.includes("hospital")) return "hospital";
  if (googleTypes.includes("pharmacy")) return "pharmacy";
  if (googleTypes.includes("dentist")) return "dentist";
  // Text search results for urgent care won't have a structured type —
  // check the name as a fallback
  if (placeName && /urgent\s*care|walk[\s-]*in/i.test(placeName)) return "urgent_care";
  return "clinic";
}

/**
 * Geocode a free-form address string to lat/lng.
 * Uses Google Places Text Search — same API as zip geocoding.
 * Results are cached by the raw query string.
 */
export async function geocodeAddress(address: string): Promise<GeoLocation | null> {
  if (!API_KEY || !address.trim()) return null;

  const key = address.trim().toLowerCase();
  const cached = geocodeCache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.loc;
  }

  const url = "https://places.googleapis.com/v1/places:searchText";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "places.location",
      },
      body: JSON.stringify({
        textQuery: address.trim(),
        maxResultCount: 1,
      }),
    });

    const data = await res.json();
    if (data.error) {
      console.error("Places address geocoding error:", data.error.message);
      return null;
    }

    const place = data.places?.[0];
    if (place?.location) {
      const loc: GeoLocation = {
        lat: place.location.latitude,
        lng: place.location.longitude,
      };
      geocodeCache.set(key, { loc, ts: Date.now() });
      return loc;
    }

    console.error("No geocoding result for address:", address);
    return null;
  } catch (err) {
    console.error("Places address geocoding request error:", err);
    return null;
  }
}

// ─── Main entry point ───────────────────────────────────

/**
 * Find nearby healthcare providers.
 *
 * Accepts either a zip code or a full street address for location.
 * When GOOGLE_PLACES_API_KEY is set: real results from Google Places.
 * Otherwise: returns mock data for development/demo.
 */
export async function findNearbyProviders(
  location: string,
  type?: string
): Promise<Provider[]> {
  // If no API key, fall back to mock data
  if (!API_KEY) {
    console.log("GOOGLE_PLACES_API_KEY not set — using mock provider data");
    return getMockProviders(type);
  }

  if (!location || !location.trim()) {
    return [];
  }

  // 1. Geocode — try zip first, then treat as address
  let center: GeoLocation | null = null;
  if (isValidZip(location)) {
    center = await geocodeZip(location);
  } else {
    center = await geocodeAddress(location);
  }
  if (!center) {
    console.error(`Could not geocode location: ${location}`);
    return [];
  }

  // 2. Search — use Nearby Search for valid types, Text Search for urgent care
  let places: PlacesResult[] = [];

  if (type === "urgent_care") {
    // No valid Nearby type for urgent care — use text search
    const raw = await searchTextPlaces("urgent care", center);
    // Tag these results so classifier knows they're urgent care
    places = raw.map((p) => ({ ...p, _isUrgentCare: true }));
  } else if (type && NEARBY_TYPE_MAP[type]) {
    places = await searchNearbyPlaces(center, NEARBY_TYPE_MAP[type]);
  } else {
    // "all" filter: run nearby for structured types + text search for urgent care in parallel
    const allNearbyTypes = Object.values(NEARBY_TYPE_MAP).flat();
    const [nearbyResults, urgentResults] = await Promise.all([
      searchNearbyPlaces(center, allNearbyTypes),
      searchTextPlaces("urgent care", center),
    ]);
    // Merge and deduplicate by place ID
    const seen = new Set<string>();
    for (const p of nearbyResults) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        places.push(p);
      }
    }
    for (const p of urgentResults) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        places.push({ ...p, _isUrgentCare: true });
      }
    }
  }

  // 4. Map to our Provider interface
  const providers: Provider[] = places.map((place) => {
    const placeLat = place.location?.latitude || center.lat;
    const placeLng = place.location?.longitude || center.lng;
    const distMiles = haversineDistance(center.lat, center.lng, placeLat, placeLng);

    return {
      id: place.id,
      name: place.displayName?.text || "Unknown Provider",
      address: place.formattedAddress || "",
      phone: place.nationalPhoneNumber || place.internationalPhoneNumber || "",
      type: place._isUrgentCare
        ? "urgent_care"
        : classifyProviderType(place.types || [], place.displayName?.text),
      distance: `${distMiles.toFixed(1)} miles`,
      rating: place.rating,
      totalRatings: place.userRatingCount,
      openNow: place.currentOpeningHours?.openNow ?? place.regularOpeningHours?.openNow,
      googleMapsUrl: place.googleMapsUri,
      websiteUrl: place.websiteUri,
      weekdayHours:
        place.currentOpeningHours?.weekdayDescriptions ??
        place.regularOpeningHours?.weekdayDescriptions,
      latitude: placeLat,
      longitude: placeLng,
    };
  });

  // 5. Enrich with NPI data (non-blocking — won't fail the search if NPPES is down)
  try {
    const npiMap = await enrichWithNpi(
      providers.map((p) => ({ name: p.name, address: p.address }))
    );
    for (const p of providers) {
      const npi = npiMap.get(p.name);
      if (npi) {
        p.npi = npi.npi;
        p.taxonomy = npi.taxonomy;
      }
    }
  } catch (err) {
    console.error("NPI enrichment failed (non-fatal):", err);
  }

  // 6. Sort by distance
  return providers.sort((a, b) => {
    const distA = parseFloat(a.distance?.replace(" miles", "") || "999");
    const distB = parseFloat(b.distance?.replace(" miles", "") || "999");
    return distA - distB;
  });
}

// ─── Mock data fallback ─────────────────────────────────

function getMockProviders(type?: string): Provider[] {
  const MOCK: Provider[] = [
    { id: "mock-1", name: "CityMed Urgent Care", address: "123 Main Street, Suite 100", phone: "(555) 123-4567", type: "urgent_care", distance: "0.8 miles", rating: 4.3, totalRatings: 127, openNow: true },
    { id: "mock-2", name: "Regional Medical Center", address: "500 Hospital Drive", phone: "(555) 987-6543", type: "hospital", distance: "2.1 miles", rating: 4.1, totalRatings: 432, openNow: true },
    { id: "mock-3", name: "QuickCare Walk-In Clinic", address: "789 Oak Avenue", phone: "(555) 456-7890", type: "urgent_care", distance: "1.5 miles", rating: 4.5, totalRatings: 89, openNow: false },
    { id: "mock-4", name: "Community Health Center", address: "456 Elm Street", phone: "(555) 234-5678", type: "clinic", distance: "3.2 miles", rating: 4.0, totalRatings: 215, openNow: true },
    { id: "mock-5", name: "Memorial Hospital", address: "1000 Medical Parkway", phone: "(555) 345-6789", type: "hospital", distance: "4.5 miles", rating: 4.6, totalRatings: 891, openNow: true },
    { id: "mock-6", name: "CVS Pharmacy", address: "200 Commerce Blvd", phone: "(555) 111-2222", type: "pharmacy", distance: "0.5 miles", rating: 3.8, totalRatings: 56, openNow: true },
    { id: "mock-7", name: "Bright Smiles Dental", address: "350 Pine Street, Suite 2B", phone: "(555) 333-4444", type: "dentist", distance: "1.8 miles", rating: 4.7, totalRatings: 198, openNow: false },
  ];

  let filtered = [...MOCK];
  if (type && type !== "all") {
    filtered = filtered.filter((p) => p.type === type);
  }

  return filtered.sort((a, b) => {
    const distA = parseFloat(a.distance?.replace(" miles", "") || "999");
    const distB = parseFloat(b.distance?.replace(" miles", "") || "999");
    return distA - distB;
  });
}

// ─── Helpers ────────────────────────────────────────────

export function formatProviderType(type: string): string {
  switch (type) {
    case "urgent_care":
      return "Urgent Care";
    case "hospital":
      return "Hospital";
    case "clinic":
      return "Clinic";
    case "pharmacy":
      return "Pharmacy";
    case "dentist":
      return "Dentist";
    default:
      return type;
  }
}
