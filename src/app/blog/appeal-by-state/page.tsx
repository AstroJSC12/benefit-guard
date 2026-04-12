import type { Metadata } from "next";
import Link from "next/link";
import { articles } from "@/lib/blog";

export const metadata: Metadata = {
  title: "How to Appeal a Denied Insurance Claim by State | BenefitGuard",
  description:
    "State-by-state guides to appealing denied health insurance claims. Find your state's specific protections, agencies, deadlines, and surprise billing laws.",
  keywords: [
    "appeal denied insurance claim by state",
    "state insurance appeal guide",
    "surprise billing by state",
    "insurance denial help",
  ],
  openGraph: {
    title: "How to Appeal a Denied Insurance Claim by State",
    description:
      "State-by-state guides to appealing denied health insurance claims.",
    type: "website",
    url: "https://benefit-guard.jeffcoy.net/blog/appeal-by-state",
  },
  alternates: {
    canonical: "https://benefit-guard.jeffcoy.net/blog/appeal-by-state",
  },
};

const stateArticles = articles.filter((a) =>
  a.slug.startsWith("how-to-appeal-denied-insurance-claim-") &&
  a.slug !== "how-to-appeal-denied-health-insurance-claim"
);

const stateInfo: Record<string, { abbr: string; highlight: string }> = {
  "how-to-appeal-denied-insurance-claim-new-york": {
    abbr: "NY",
    highlight: "DFS external appeal, Assignment of Benefits law",
  },
  "how-to-appeal-denied-insurance-claim-california": {
    abbr: "CA",
    highlight: "Free binding Independent Medical Review (DMHC)",
  },
  "how-to-appeal-denied-insurance-claim-texas": {
    abbr: "TX",
    highlight: "SB 1264 surprise billing, IRO binding review",
  },
  "how-to-appeal-denied-insurance-claim-florida": {
    abbr: "FL",
    highlight: "HMO balance billing ban, 20-day prompt payment",
  },
  "how-to-appeal-denied-insurance-claim-illinois": {
    abbr: "IL",
    highlight: "SB 1840 surprise billing, telehealth parity",
  },
  "how-to-appeal-denied-insurance-claim-pennsylvania": {
    abbr: "PA",
    highlight: "Act 112 surprise billing ban, two-level appeal",
  },
  "how-to-appeal-denied-insurance-claim-ohio": {
    abbr: "OH",
    highlight: "60-day external review window, HMO point-of-service",
  },
  "how-to-appeal-denied-insurance-claim-georgia": {
    abbr: "GA",
    highlight: "HB 888 surprise billing, 15-day prompt payment",
  },
};

export default function AppealByStatePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "How to Appeal a Denied Insurance Claim by State",
    description:
      "State-by-state guides to appealing denied health insurance claims.",
    url: "https://benefit-guard.jeffcoy.net/blog/appeal-by-state",
    publisher: { "@type": "Organization", name: "BenefitGuard" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            How to Appeal a Denied Insurance Claim — By State
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Every state has its own insurance protections, appeal deadlines,
            and regulatory agencies. Find your state below for a detailed
            guide on how to fight a denied claim using your state&apos;s
            specific laws.
          </p>
          <p className="mt-4 text-muted-foreground">
            Not sure where to start?{" "}
            <Link
              href="/blog/how-to-appeal-denied-health-insurance-claim"
              className="text-primary underline hover:text-primary/80"
            >
              Read our federal appeal guide first
            </Link>{" "}
            — it covers the rights every American has under the ACA, regardless
            of state.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {stateArticles.map((article) => {
            const info = stateInfo[article.slug];
            return (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="group block rounded-lg border bg-card p-5 hover:border-primary/50 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <span className="shrink-0 text-2xl font-bold text-primary">
                    {info?.abbr || ""}
                  </span>
                  <div>
                    <h2 className="font-semibold group-hover:text-primary transition-colors">
                      {article.title.replace("How to Appeal a Denied Insurance Claim in ", "")}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {info?.highlight || article.description}
                    </p>
                    <span className="text-xs text-muted-foreground mt-2 inline-block">
                      {article.readingTime}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 rounded-lg bg-muted/50 border p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">
            Don&apos;t see your state?
          </h3>
          <p className="text-muted-foreground mb-4">
            We&apos;re adding more states soon. In the meantime, the{" "}
            <Link
              href="/blog/how-to-appeal-denied-health-insurance-claim"
              className="text-primary underline"
            >
              federal appeal guide
            </Link>{" "}
            covers your rights under the ACA — which apply in all 50 states.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Get Personalized Help
          </Link>
        </div>
      </div>
    </>
  );
}
