/**
 * Insurer Directory Deep Links
 *
 * Maps major US health insurers to their online provider finder URLs.
 * Used to generate "Check Network Status" links on provider cards,
 * allowing users to verify in-network status directly with their insurer.
 *
 * Each entry includes:
 * - keywords: strings to match against SBC document text to detect the insurer
 * - finderUrl: the insurer's provider search URL
 * - buildUrl: optional function to build a pre-filled search URL with provider details
 */

export interface InsurerDirectory {
  id: string;
  name: string;
  keywords: string[];
  finderUrl: string;
  buildUrl?: (params: { providerName?: string; zip?: string }) => string;
}

export const INSURER_DIRECTORIES: InsurerDirectory[] = [
  {
    id: "aetna",
    name: "Aetna",
    keywords: ["aetna", "aetna life", "aetna health"],
    finderUrl: "https://www.aetna.com/dsepublicContent1/assets/pages/defined/findDoctor.html",
    buildUrl: ({ zip }) =>
      `https://www.aetna.com/dsepublicContent1/assets/pages/defined/findDoctor.html${zip ? `?zipCode=${zip}` : ""}`,
  },
  {
    id: "anthem",
    name: "Anthem / Elevance",
    keywords: ["anthem", "elevance", "anthem blue cross"],
    finderUrl: "https://www.anthem.com/find-care/",
    buildUrl: ({ zip }) =>
      `https://www.anthem.com/find-care/${zip ? `?zipCode=${zip}` : ""}`,
  },
  {
    id: "bcbs",
    name: "Blue Cross Blue Shield",
    keywords: ["blue cross", "blue shield", "bcbs", "bluecross", "blueshield"],
    finderUrl: "https://www.bcbs.com/find-a-doctor",
    buildUrl: () => "https://www.bcbs.com/find-a-doctor",
  },
  {
    id: "cigna",
    name: "Cigna",
    keywords: ["cigna", "cigna health"],
    finderUrl: "https://hcpdirectory.cigna.com/web/public/consumer/directory",
    buildUrl: ({ zip }) =>
      `https://hcpdirectory.cigna.com/web/public/consumer/directory${zip ? `?postalCode=${zip}` : ""}`,
  },
  {
    id: "humana",
    name: "Humana",
    keywords: ["humana"],
    finderUrl: "https://www.humana.com/finder/medical",
    buildUrl: ({ zip }) =>
      `https://www.humana.com/finder/medical${zip ? `?zipCode=${zip}` : ""}`,
  },
  {
    id: "kaiser",
    name: "Kaiser Permanente",
    keywords: ["kaiser", "kaiser permanente"],
    finderUrl: "https://healthy.kaiserpermanente.org/health/care/!ut/p/a0/doctor-finder",
    buildUrl: () =>
      "https://healthy.kaiserpermanente.org/health/care/!ut/p/a0/doctor-finder",
  },
  {
    id: "molina",
    name: "Molina Healthcare",
    keywords: ["molina"],
    finderUrl: "https://www.molinahealthcare.com/members/common/en-us/fad/provdir.aspx",
    buildUrl: () =>
      "https://www.molinahealthcare.com/members/common/en-us/fad/provdir.aspx",
  },
  {
    id: "oscar",
    name: "Oscar Health",
    keywords: ["oscar", "oscar health"],
    finderUrl: "https://www.hioscar.com/search",
    buildUrl: () => "https://www.hioscar.com/search",
  },
  {
    id: "united",
    name: "UnitedHealthcare",
    keywords: ["unitedhealthcare", "united healthcare", "uhc", "united health"],
    finderUrl: "https://www.uhc.com/find-a-doctor",
    buildUrl: ({ zip }) =>
      `https://www.uhc.com/find-a-doctor${zip ? `?zipCode=${zip}` : ""}`,
  },
  {
    id: "centene",
    name: "Centene / Ambetter",
    keywords: ["centene", "ambetter"],
    finderUrl: "https://ambetter.findyourplan.com/",
    buildUrl: () => "https://ambetter.findyourplan.com/",
  },
  {
    id: "medicare",
    name: "Medicare",
    keywords: ["medicare", "cms"],
    finderUrl: "https://www.medicare.gov/care-compare/",
    buildUrl: ({ zip }) =>
      `https://www.medicare.gov/care-compare/${zip ? `#search?zipCode=${zip}` : ""}`,
  },
  {
    id: "medicaid",
    name: "Medicaid",
    keywords: ["medicaid"],
    finderUrl: "https://www.healthcare.gov/medicaid-chip/",
    buildUrl: () => "https://www.healthcare.gov/medicaid-chip/",
  },
];

/**
 * Detect the user's insurer by scanning their uploaded document text
 * for known insurer keywords. Returns the best match or null.
 */
export function detectInsurer(documentTexts: string[]): InsurerDirectory | null {
  const combined = documentTexts.join(" ").toLowerCase();

  // Score each insurer by how many keyword hits appear in the documents
  let bestMatch: InsurerDirectory | null = null;
  let bestScore = 0;

  for (const insurer of INSURER_DIRECTORIES) {
    let score = 0;
    for (const keyword of insurer.keywords) {
      // Count occurrences — more mentions = higher confidence
      const regex = new RegExp(keyword.toLowerCase(), "g");
      const matches = combined.match(regex);
      if (matches) {
        score += matches.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = insurer;
    }
  }

  // Require at least 2 keyword hits to avoid false positives
  return bestScore >= 2 ? bestMatch : null;
}
