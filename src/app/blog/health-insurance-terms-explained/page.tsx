import type { Metadata } from "next";
import Link from "next/link";
import { ArticleLayout } from "@/components/blog/article-layout";
import { getArticleBySlug } from "@/lib/blog";

const article = getArticleBySlug("health-insurance-terms-explained")!;

export const metadata: Metadata = {
  title: article.title + " | BenefitGuard",
  description: article.description,
  keywords: article.keywords,
  openGraph: {
    title: article.title,
    description: article.description,
    type: "article",
    publishedTime: article.publishedAt,
    url: `https://benefit-guard.jeffcoy.net/blog/${article.slug}`,
  },
  alternates: {
    canonical: `https://benefit-guard.jeffcoy.net/blog/${article.slug}`,
  },
};

export default function HealthInsuranceTermsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    author: { "@type": "Organization", name: "BenefitGuard" },
    publisher: { "@type": "Organization", name: "BenefitGuard" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleLayout article={article}>
        <p>
          Only <strong>4% of Americans</strong> can correctly define deductible,
          copay, coinsurance, and out-of-pocket maximum. And 83% of people who
          say they &quot;definitely understand&quot; what a copay is get the definition
          wrong.
        </p>
        <p>
          The insurance industry uses complicated terminology that makes it
          nearly impossible for normal people to understand what they&apos;re paying
          for. This glossary translates every major health insurance term into
          plain English, with real-world examples.
        </p>

        <h2>The Big Four: Terms You Must Know</h2>

        <h3>Premium</h3>
        <p>
          <strong>What it is:</strong> The monthly payment you make to have
          insurance. You pay this whether or not you use any healthcare
          services.
        </p>
        <p>
          <strong>Real-world example:</strong> Your employer deducts $350/month
          from your paycheck for health insurance. That&apos;s your premium. You pay
          it every month even if you never see a doctor.
        </p>
        <p>
          <strong>Key thing to know:</strong> A lower premium usually means
          higher costs when you actually use healthcare (higher deductible,
          higher copays). A higher premium usually means lower costs at the
          point of care. Neither is universally &quot;better&quot; — it depends on how
          much healthcare you expect to use.
        </p>

        <h3>Deductible</h3>
        <p>
          <strong>What it is:</strong> The amount you pay out of your own
          pocket before your insurance starts paying for most services. It
          resets every year (usually January 1).
        </p>
        <p>
          <strong>Real-world example:</strong> Your plan has a $1,500
          deductible. You break your arm and the ER bill is $3,000. You pay
          the first $1,500 (your deductible). After that, insurance kicks in
          and covers a percentage of the remaining $1,500.
        </p>
        <p>
          <strong>Key thing to know:</strong> Some services are covered{" "}
          <em>before</em> you meet your deductible — like preventive care
          (annual checkups, vaccinations, certain screenings). These are
          required to be free under the ACA, regardless of your deductible
          status.
        </p>

        <h3>Copay (Copayment)</h3>
        <p>
          <strong>What it is:</strong> A flat fee you pay for a specific
          service, like a doctor visit or prescription. The amount is set in
          advance by your plan.
        </p>
        <p>
          <strong>Real-world example:</strong> Your plan says &quot;$30 copay for
          primary care visits.&quot; You visit your doctor, you pay $30 at the
          front desk, and insurance covers the rest. It doesn&apos;t matter if the
          visit costs $150 or $400 — you pay $30.
        </p>
        <p>
          <strong>Key thing to know:</strong> Copays are different from
          coinsurance. A copay is a flat dollar amount. Coinsurance is a
          percentage. Some plans use copays for certain services and
          coinsurance for others.
        </p>

        <h3>Coinsurance</h3>
        <p>
          <strong>What it is:</strong> Your share of the cost of a covered
          service, calculated as a percentage, after you&apos;ve met your
          deductible.
        </p>
        <p>
          <strong>Real-world example:</strong> Your plan has 20% coinsurance.
          After you meet your deductible, you have an MRI that costs $2,000.
          Insurance pays 80% ($1,600). You pay 20% ($400).
        </p>
        <p>
          <strong>Key thing to know:</strong> Coinsurance only applies after
          your deductible is met. Before that, you&apos;re paying full price (up to
          the allowed amount). The good news: your coinsurance payments count
          toward your out-of-pocket maximum.
        </p>

        <h2>The Safety Net</h2>

        <h3>Out-of-Pocket Maximum (OOP Max)</h3>
        <p>
          <strong>What it is:</strong> The most you&apos;ll pay for covered
          services in a plan year. After you reach this amount, your insurance
          pays 100% of covered services.
        </p>
        <p>
          <strong>Real-world example:</strong> Your out-of-pocket max is
          $6,000. You have a bad year — surgery, physical therapy, multiple
          specialist visits. Once your deductible payments, copays, and
          coinsurance add up to $6,000, your insurance covers everything else
          at 100% for the rest of the year.
        </p>
        <p>
          <strong>Key thing to know:</strong> Your monthly premium does NOT
          count toward the out-of-pocket max. Only deductibles, copays, and
          coinsurance count. For 2026, the ACA limits the out-of-pocket
          maximum to $9,450 for individual plans and $18,900 for family plans.
        </p>

        <h2>Network Terms</h2>

        <h3>In-Network</h3>
        <p>
          <strong>What it is:</strong> A healthcare provider (doctor, hospital,
          lab) that has a contract with your insurance company to provide
          services at pre-negotiated rates.
        </p>
        <p>
          <strong>Why it matters:</strong> In-network providers are almost
          always cheaper for you. Your insurance covers a larger share of the
          cost, and the provider can&apos;t charge you more than the negotiated
          rate.
        </p>

        <h3>Out-of-Network</h3>
        <p>
          <strong>What it is:</strong> A provider that doesn&apos;t have a contract
          with your insurer. They can charge whatever they want, and your
          insurance may pay little or nothing.
        </p>
        <p>
          <strong>Why it matters:</strong> Out-of-network care can be
          dramatically more expensive. Some plans (like HMOs) provide zero
          coverage for out-of-network services except in emergencies. PPO and
          POS plans typically cover some portion, but at a much higher cost to
          you.
        </p>

        <h3>Balance Billing</h3>
        <p>
          <strong>What it is:</strong> When an out-of-network provider bills
          you for the difference between their charge and what your insurance
          paid.
        </p>
        <p>
          <strong>Real-world example:</strong> An out-of-network surgeon
          charges $10,000 for a procedure. Your insurance pays $6,000 (what
          they consider &quot;reasonable&quot;). The surgeon bills you for the remaining
          $4,000. That&apos;s a balance bill.
        </p>
        <p>
          <strong>Key thing to know:</strong> The{" "}
          <Link href="/blog/no-surprises-act-your-rights">
            No Surprises Act
          </Link>{" "}
          bans balance billing in most emergency and certain non-emergency
          situations. In-network providers can never balance bill you.
        </p>

        <h2>Plan Types</h2>

        <h3>HMO (Health Maintenance Organization)</h3>
        <p>
          <strong>How it works:</strong> You choose a primary care physician
          (PCP) who manages your care. You need a referral from your PCP to
          see a specialist. Only in-network providers are covered (except
          emergencies).
        </p>
        <p>
          <strong>Best for:</strong> People who want lower premiums and don&apos;t
          mind coordinating care through a PCP. Worst for: People who want
          flexibility to see any doctor without a referral.
        </p>

        <h3>PPO (Preferred Provider Organization)</h3>
        <p>
          <strong>How it works:</strong> You can see any doctor, in-network or
          out-of-network, without a referral. In-network care costs less.
          Out-of-network care is covered but at a higher cost to you.
        </p>
        <p>
          <strong>Best for:</strong> People who want flexibility and are
          willing to pay higher premiums for it. Most popular plan type in
          employer-sponsored insurance.
        </p>

        <h3>EPO (Exclusive Provider Organization)</h3>
        <p>
          <strong>How it works:</strong> Like a PPO, you don&apos;t need referrals.
          But like an HMO, only in-network providers are covered (except
          emergencies). A hybrid of the two.
        </p>
        <p>
          <strong>Best for:</strong> People who want referral-free access but
          are okay staying within the network.
        </p>

        <h3>POS (Point of Service)</h3>
        <p>
          <strong>How it works:</strong> A hybrid of HMO and PPO. You choose a
          PCP and need referrals for specialists (like an HMO), but you can
          also see out-of-network providers at a higher cost (like a PPO).
        </p>

        <h2>Document Terms</h2>

        <h3>
          Summary of Benefits and Coverage (SBC)
        </h3>
        <p>
          A standardized document that your insurer must provide, showing
          exactly what your plan covers, what it costs, and what&apos;s excluded.
          It includes specific examples (like having a baby or managing
          diabetes) so you can estimate your costs. Every plan uses the same
          format, making it easier to compare.
        </p>

        <h3>
          Explanation of Benefits (EOB)
        </h3>
        <p>
          A statement you receive after a claim is processed, showing what was
          billed, what insurance paid, and what you owe. It is not a bill.{" "}
          <Link href="/blog/how-to-read-your-eob">
            Read our full EOB guide here.
          </Link>
        </p>

        <h2>Other Important Terms</h2>

        <h3>Prior Authorization (Pre-Authorization)</h3>
        <p>
          Some treatments, procedures, or medications require your insurer&apos;s
          approval before you receive them. If you skip prior auth, the claim
          may be denied — even if the treatment is covered by your plan.
        </p>
        <p>
          <strong>Key thing to know:</strong> 51% of insured adults have been
          required to get a prior authorization, and nearly half found the
          process difficult to navigate. If your prior auth is denied, you can
          appeal — and your doctor can request a peer-to-peer review with the
          insurer&apos;s medical reviewer.
        </p>

        <h3>Formulary</h3>
        <p>
          Your insurance plan&apos;s list of covered prescription drugs, organized
          into tiers. Lower tiers (generics) are cheaper. Higher tiers
          (brand-name, specialty) cost more. If your medication isn&apos;t on the
          formulary, you may pay full price or need to request an exception.
        </p>

        <h3>Coordination of Benefits (COB)</h3>
        <p>
          If you&apos;re covered by two insurance plans (for example, your own
          employer plan and your spouse&apos;s plan), COB determines which plan
          pays first (primary) and which pays second (secondary). The combined
          coverage often reduces your out-of-pocket costs.
        </p>

        <h3>COBRA</h3>
        <p>
          A federal law that lets you keep your employer-sponsored health
          insurance for up to 18 months after you leave your job (or certain
          other qualifying events). The catch: you pay the full premium —
          including the portion your employer used to pay — plus a 2%
          administrative fee. It&apos;s expensive, but it guarantees continued
          coverage while you transition.
        </p>

        <h3>Special Enrollment Period (SEP)</h3>
        <p>
          Outside of the annual Open Enrollment period, you can only sign up
          for or change health insurance plans if you have a qualifying life
          event — like losing your job, getting married, having a baby, or
          moving to a new state. This window is typically 60 days from the
          qualifying event.
        </p>

        <h2>The Bottom Line</h2>
        <p>
          Insurance is complicated on purpose. But you don&apos;t need to memorize
          every term — you just need to understand the ones that affect your
          wallet. Bookmark this page for the next time you get a confusing
          bill, denial letter, or EOB.
        </p>
        <p>
          Or better yet — let{" "}
          <Link href="/auth/signup">BenefitGuard</Link> read your actual
          insurance documents and explain them in plain English, personalized
          to your specific plan.
        </p>
      </ArticleLayout>
    </>
  );
}
