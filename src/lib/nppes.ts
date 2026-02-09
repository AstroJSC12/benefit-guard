/**
 * NPPES NPI Registry Integration
 *
 * The National Plan & Provider Enumeration System (NPPES) maintains the
 * NPI Registry — a free, public database of every healthcare provider
 * in the United States. Each provider has a unique 10-digit NPI number.
 *
 * This module looks up NPIs by provider name and location, enriching
 * our Google Places provider data with the official NPI. This is the
 * foundation for cross-referencing with CMS Transparency in Coverage
 * data to determine in-network/out-of-network status.
 *
 * API docs: https://npiregistry.cms.hhs.gov/api-page
 * No API key required. Rate limit: ~100 requests/minute.
 */

const NPPES_API_URL = "https://npiregistry.cms.hhs.gov/api/";
const NPPES_VERSION = "2.1";

interface NppesResult {
  number: string; // The 10-digit NPI
  enumeration_type: string; // "NPI-1" (individual) or "NPI-2" (organization)
  basic: {
    organization_name?: string;
    first_name?: string;
    last_name?: string;
    credential?: string;
    status: string;
  };
  taxonomies: {
    code: string;
    desc: string;
    primary: boolean;
    state: string;
    license: string;
  }[];
  addresses: {
    address_purpose: string;
    address_1: string;
    city: string;
    state: string;
    postal_code: string;
    telephone_number?: string;
  }[];
}

interface NppesApiResponse {
  result_count: number;
  results: NppesResult[];
}

export interface NpiLookupResult {
  npi: string;
  taxonomy: string;
}

// Simple in-memory cache for NPI lookups
const npiCache = new Map<string, { result: NpiLookupResult | null; ts: number }>();
const NPI_CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours (NPIs don't change often)

/**
 * Look up a provider's NPI by organization name and state.
 *
 * For organizations (hospitals, clinics, pharmacies), we search by
 * organization name. Returns the best match or null.
 */
export async function lookupNpi(
  providerName: string,
  state?: string
): Promise<NpiLookupResult | null> {
  if (!providerName || providerName === "Unknown Provider") return null;

  // Check cache
  const cacheKey = `${providerName}|${state || ""}`.toLowerCase();
  const cached = npiCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < NPI_CACHE_TTL) {
    return cached.result;
  }

  // Clean the name for search (remove common suffixes that may not be in NPPES)
  const cleanName = providerName
    .replace(/\s*(inc|llc|corp|ltd|group|associates|pc|pllc)\.?$/i, "")
    .trim();

  const params = new URLSearchParams({
    version: NPPES_VERSION,
    organization_name: cleanName,
    limit: "5",
    ...(state ? { state } : {}),
  });

  try {
    const res = await fetch(`${NPPES_API_URL}?${params}`, {
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!res.ok) {
      console.error("NPPES API error:", res.status);
      return null;
    }

    const data: NppesApiResponse = await res.json();

    if (data.result_count === 0 || !data.results?.length) {
      npiCache.set(cacheKey, { result: null, ts: Date.now() });
      return null;
    }

    // Find the best match — prefer exact name matches
    const lowerName = cleanName.toLowerCase();
    const match =
      data.results.find(
        (r) =>
          r.basic.organization_name?.toLowerCase().includes(lowerName) ||
          lowerName.includes(r.basic.organization_name?.toLowerCase() || "___")
      ) || data.results[0];

    const primaryTaxonomy = match.taxonomies?.find((t) => t.primary);

    const result: NpiLookupResult = {
      npi: match.number,
      taxonomy: primaryTaxonomy?.desc || "",
    };

    npiCache.set(cacheKey, { result, ts: Date.now() });
    return result;
  } catch (err) {
    // Don't let NPI lookup failures break the provider search
    console.error("NPPES lookup error:", err);
    return null;
  }
}

/**
 * Batch enrich providers with NPI data.
 * Runs lookups in parallel (limited concurrency) to avoid
 * overwhelming the NPPES API.
 */
export async function enrichWithNpi(
  providers: { name: string; address?: string }[],
  concurrency = 3
): Promise<Map<string, NpiLookupResult>> {
  const results = new Map<string, NpiLookupResult>();

  // Extract state from address (e.g., "123 Main St, New York, NY 10001" → "NY")
  function extractState(address?: string): string | undefined {
    if (!address) return undefined;
    const match = address.match(/\b([A-Z]{2})\s+\d{5}/);
    return match?.[1];
  }

  // Process in batches to respect rate limits
  for (let i = 0; i < providers.length; i += concurrency) {
    const batch = providers.slice(i, i + concurrency);
    const lookups = batch.map(async (p) => {
      const state = extractState(p.address);
      const result = await lookupNpi(p.name, state);
      if (result) {
        results.set(p.name, result);
      }
    });
    await Promise.all(lookups);
  }

  return results;
}
