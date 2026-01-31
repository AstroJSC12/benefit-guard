/**
 * Provider Lookup Module (MOCK DATA)
 * 
 * This module provides provider search functionality.
 * 
 * CURRENT STATUS: Returns static mock data. Does not use real location data.
 * 
 * FUTURE WORK: Integrate with Google Places API or similar to:
 * 1. Accept actual zip code/coordinates
 * 2. Return real nearby healthcare facilities
 * 3. Include ratings, hours, and insurance acceptance info
 * 
 * The mock data demonstrates the UI/UX pattern without external API costs.
 */

import { Provider } from "@/types";

// Mock provider data - replace with real API integration
const MOCK_PROVIDERS: Provider[] = [
  {
    id: "1",
    name: "CityMed Urgent Care",
    address: "123 Main Street, Suite 100",
    phone: "(555) 123-4567",
    type: "urgent_care",
    distance: "0.8 miles",
  },
  {
    id: "2",
    name: "Regional Medical Center",
    address: "500 Hospital Drive",
    phone: "(555) 987-6543",
    type: "hospital",
    distance: "2.1 miles",
  },
  {
    id: "3",
    name: "QuickCare Walk-In Clinic",
    address: "789 Oak Avenue",
    phone: "(555) 456-7890",
    type: "urgent_care",
    distance: "1.5 miles",
  },
  {
    id: "4",
    name: "Community Health Center",
    address: "456 Elm Street",
    phone: "(555) 234-5678",
    type: "clinic",
    distance: "3.2 miles",
  },
  {
    id: "5",
    name: "Memorial Hospital",
    address: "1000 Medical Parkway",
    phone: "(555) 345-6789",
    type: "hospital",
    distance: "4.5 miles",
  },
];

/**
 * Find nearby healthcare providers.
 * 
 * @param zipCode - User's zip code (currently ignored - using mock data)
 * @param type - Filter by provider type
 * @returns Array of providers sorted by distance
 */
export async function findNearbyProviders(
  zipCode: string,
  type?: "urgent_care" | "hospital" | "clinic"
): Promise<Provider[]> {
  // Simulate network delay for realistic UX testing
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  // Note: zipCode is currently ignored - mock data is static
  // In production, this would query an external API
  let providers = [...MOCK_PROVIDERS];
  
  if (type) {
    providers = providers.filter((p) => p.type === type);
  }
  
  return providers.sort((a, b) => {
    const distA = parseFloat(a.distance?.replace(" miles", "") || "999");
    const distB = parseFloat(b.distance?.replace(" miles", "") || "999");
    return distA - distB;
  });
}

export function formatProviderType(type: string): string {
  switch (type) {
    case "urgent_care":
      return "Urgent Care";
    case "hospital":
      return "Hospital";
    case "clinic":
      return "Clinic";
    default:
      return type;
  }
}
