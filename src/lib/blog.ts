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
