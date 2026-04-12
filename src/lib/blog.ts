export interface BlogArticle {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  readingTime: string;
  category: "guides" | "rights" | "glossary";
  keywords: string[];
}

export const articles: BlogArticle[] = [
  {
    slug: "how-to-appeal-denied-health-insurance-claim",
    title: "How to Appeal a Denied Health Insurance Claim: Step-by-Step Guide",
    description:
      "Your health insurance claim was denied. Here's the exact step-by-step process to appeal it, including phone scripts, your legal rights, and what to say to win.",
    publishedAt: "2026-04-11",
    readingTime: "12 min read",
    category: "guides",
    keywords: [
      "how to appeal denied health insurance claim",
      "insurance claim denied what to do",
      "health insurance appeal process",
      "denied claim appeal",
    ],
  },
  {
    slug: "how-to-read-your-eob",
    title: "How to Read Your Explanation of Benefits (EOB): A Complete Guide",
    description:
      "Your EOB isn't a bill — but most people don't know what it actually is. Learn how to read every section of your Explanation of Benefits and spot errors before you pay.",
    publishedAt: "2026-04-11",
    readingTime: "10 min read",
    category: "guides",
    keywords: [
      "how to read an EOB",
      "what does my EOB mean",
      "explanation of benefits explained",
      "EOB vs medical bill",
    ],
  },
  {
    slug: "check-medical-bill-for-errors",
    title: "How to Check Your Medical Bill for Errors: 7-Point Checklist",
    description:
      "Up to 80% of medical bills contain errors. Use this 7-point checklist to find duplicate charges, wrong codes, and phantom services before you pay a cent.",
    publishedAt: "2026-04-11",
    readingTime: "9 min read",
    category: "guides",
    keywords: [
      "medical bill errors",
      "how to check medical bill",
      "is my medical bill wrong",
      "medical billing errors",
    ],
  },
  {
    slug: "health-insurance-terms-explained",
    title:
      "Health Insurance Terms Explained: The Complete Glossary in Plain English",
    description:
      "Deductible, copay, coinsurance, out-of-pocket maximum — finally understand what every health insurance term actually means, with real-world examples.",
    publishedAt: "2026-04-11",
    readingTime: "11 min read",
    category: "glossary",
    keywords: [
      "health insurance terms explained",
      "what does coinsurance mean",
      "deductible vs copay",
      "health insurance glossary",
    ],
  },
  {
    slug: "no-surprises-act-your-rights",
    title:
      "Your Rights Under the No Surprises Act: What You Need to Know in 2026",
    description:
      "The No Surprises Act protects you from unexpected medical bills in emergencies and at in-network facilities. Here's exactly what it covers, what it doesn't, and what to do if you get a surprise bill.",
    publishedAt: "2026-04-11",
    readingTime: "10 min read",
    category: "rights",
    keywords: [
      "no surprises act explained",
      "surprise medical bill what to do",
      "balance billing protection",
      "emergency room out of network bill",
    ],
  },
  {
    slug: "how-to-appeal-denied-insurance-claim-new-york",
    title: "How to Appeal a Denied Insurance Claim in New York",
    description:
      "New York has some of the strongest surprise bill and insurance appeal protections in the country. Here's how to use them to fight a denied claim in NY.",
    publishedAt: "2026-04-11",
    readingTime: "9 min read",
    category: "guides",
    keywords: [
      "appeal denied insurance claim new york",
      "NY insurance denial",
      "new york external appeal",
      "DFS insurance complaint new york",
    ],
  },
  {
    slug: "how-to-appeal-denied-insurance-claim-california",
    title: "How to Appeal a Denied Insurance Claim in California",
    description:
      "California's Independent Medical Review gives you a free, binding appeal when your insurer denies care. Here's exactly how to use it.",
    publishedAt: "2026-04-11",
    readingTime: "9 min read",
    category: "guides",
    keywords: [
      "appeal denied insurance claim california",
      "california independent medical review",
      "DMHC complaint",
      "CA insurance denial",
    ],
  },
  {
    slug: "how-to-appeal-denied-insurance-claim-texas",
    title: "How to Appeal a Denied Insurance Claim in Texas",
    description:
      "Texas SB 1264 protects you from surprise bills, and state law gives you strong appeal rights. Here's how to fight a denied claim in Texas step by step.",
    publishedAt: "2026-04-11",
    readingTime: "9 min read",
    category: "guides",
    keywords: [
      "appeal denied insurance claim texas",
      "texas insurance denial",
      "TDI complaint texas",
      "texas surprise bill law",
    ],
  },
  {
    slug: "how-to-appeal-denied-insurance-claim-florida",
    title: "How to Appeal a Denied Insurance Claim in Florida",
    description:
      "Florida offers external review, prompt payment rules, and HMO balance billing protections. Here's how to fight a denied claim in Florida.",
    publishedAt: "2026-04-11",
    readingTime: "9 min read",
    category: "guides",
    keywords: [
      "appeal denied insurance claim florida",
      "florida insurance denial",
      "OIR complaint florida",
      "florida balance billing",
    ],
  },
  {
    slug: "how-to-appeal-denied-insurance-claim-illinois",
    title: "How to Appeal a Denied Insurance Claim in Illinois",
    description:
      "Illinois SB 1840 protects you from surprise bills, and the state offers binding external review. Here's how to appeal a denied claim in IL.",
    publishedAt: "2026-04-11",
    readingTime: "9 min read",
    category: "guides",
    keywords: [
      "appeal denied insurance claim illinois",
      "illinois insurance denial",
      "illinois external review",
      "IL DOI complaint",
    ],
  },
  {
    slug: "how-to-appeal-denied-insurance-claim-pennsylvania",
    title: "How to Appeal a Denied Insurance Claim in Pennsylvania",
    description:
      "Pennsylvania Act 112 bans surprise billing and Act 68 gives you binding external review rights. Here's how to appeal a denial in PA.",
    publishedAt: "2026-04-11",
    readingTime: "9 min read",
    category: "guides",
    keywords: [
      "appeal denied insurance claim pennsylvania",
      "PA insurance denial",
      "pennsylvania external review",
      "PID complaint",
    ],
  },
  {
    slug: "how-to-appeal-denied-insurance-claim-ohio",
    title: "How to Appeal a Denied Insurance Claim in Ohio",
    description:
      "Ohio law gives you external review rights and HMO-specific protections. Here's how to fight a denied insurance claim in OH step by step.",
    publishedAt: "2026-04-11",
    readingTime: "9 min read",
    category: "guides",
    keywords: [
      "appeal denied insurance claim ohio",
      "ohio insurance denial",
      "ODI complaint ohio",
      "ohio external review",
    ],
  },
  {
    slug: "how-to-appeal-denied-insurance-claim-georgia",
    title: "How to Appeal a Denied Insurance Claim in Georgia",
    description:
      "Georgia HB 888 protects you from surprise medical bills. Here's how to appeal a denied insurance claim in GA and which agencies can help.",
    publishedAt: "2026-04-11",
    readingTime: "9 min read",
    category: "guides",
    keywords: [
      "appeal denied insurance claim georgia",
      "georgia insurance denial",
      "GA insurance commissioner complaint",
      "georgia surprise billing",
    ],
  },
];

export function getArticleBySlug(slug: string): BlogArticle | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getRelatedArticles(
  currentSlug: string,
  limit = 3
): BlogArticle[] {
  return articles.filter((a) => a.slug !== currentSlug).slice(0, limit);
}
