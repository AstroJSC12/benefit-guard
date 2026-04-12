import type { Metadata } from "next";
import Link from "next/link";
import { ArticleLayout } from "@/components/blog/article-layout";
import { getArticleBySlug } from "@/lib/blog";

const article = getArticleBySlug("how-to-appeal-denied-insurance-claim-pennsylvania")!;

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

export default function AppealDeniedClaimPennsylvaniaPage() {
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
          If your health insurance claim was denied in Pennsylvania, you have
          strong protections under <strong>Act 112</strong> (surprise billing
          ban) and <strong>Act 68</strong> (managed care external review). The{" "}
          <strong>Pennsylvania Insurance Department (PID)</strong> enforces
          these protections and handles consumer complaints.
        </p>
        <p>
          This guide covers the specific PA appeal process, deadlines, and
          agencies — on top of the{" "}
          <Link href="/blog/how-to-appeal-denied-health-insurance-claim">
            federal appeal rights
          </Link>{" "}
          every American has under the ACA.
        </p>

        <h2>Pennsylvania&apos;s Surprise Billing Ban (Act 112)</h2>
        <p>
          PA Act 112 prohibits balance billing in two key situations:
        </p>
        <ul>
          <li>
            <strong>Emergency services</strong> at out-of-network facilities
          </li>
          <li>
            <strong>Out-of-network providers at in-network facilities</strong>{" "}
            when you didn&apos;t choose the provider
          </li>
        </ul>
        <p>
          In both cases, you only owe your in-network cost-sharing. These
          protections work alongside the federal{" "}
          <Link href="/blog/no-surprises-act-your-rights">
            No Surprises Act
          </Link>
          .
        </p>

        <h2>External Review (Act 68)</h2>
        <p>
          Pennsylvania&apos;s Act 68 provides a thorough appeals process for
          HMO and PPO plan denials:
        </p>
        <ul>
          <li>
            An <strong>independent review organization (IRO)</strong> examines
            your case
          </li>
          <li>
            The IRO&apos;s decision is <strong>binding on the insurer</strong>
          </li>
          <li>
            Available after exhausting internal appeals — or immediately for
            urgent cases
          </li>
        </ul>

        <h2>PA Appeals Process — Step by Step</h2>

        <h3>Step 1: Internal Appeal (First Level)</h3>
        <p>
          File within <strong>180 days</strong> of the denial. Include your
          doctor&apos;s letter of medical necessity, medical records, and a
          clear explanation of why the denial is wrong.
        </p>
        <p>
          Your insurer must respond within <strong>30 days</strong>.
        </p>

        <h3>Step 2: Internal Appeal (Second Level)</h3>
        <p>
          If the first-level appeal is denied, Pennsylvania requires a
          second-level internal review. This must be decided within{" "}
          <strong>45 days</strong>.
        </p>

        <h3>Step 3: External Review</h3>
        <p>
          After exhausting both internal appeal levels, you can request an
          external review through the PID. The external reviewer is fully
          independent and their decision is binding.
        </p>
        <p>
          For <strong>urgent cases</strong>, you can request expedited
          external review without waiting for internal appeals to conclude.
        </p>

        <h3>Step 4: File a Complaint</h3>
        <p>
          If your insurer violates Pennsylvania law:
        </p>
        <ul>
          <li>
            <strong>Phone:</strong> 1-877-881-6388
          </li>
          <li>
            <strong>Online:</strong>{" "}
            <a
              href="https://www.insurance.pa.gov"
              target="_blank"
              rel="noopener noreferrer"
            >
              insurance.pa.gov
            </a>
          </li>
          <li>
            Consumer hotline available Monday–Friday, 8am–5pm
          </li>
        </ul>

        <h2>Additional Pennsylvania Protections</h2>
        <ul>
          <li>
            <strong>Network adequacy:</strong> Your plan must maintain an
            adequate network of providers
          </li>
          <li>
            <strong>Women&apos;s preventive health:</strong> Direct access to
            OB/GYN without a referral
          </li>
          <li>
            <strong>Mental health parity:</strong> Coverage for mental health
            must be equivalent to medical/surgical benefits
          </li>
          <li>
            <strong>Continuity of care:</strong> Provisions for continued care
            when transitioning between plans
          </li>
          <li>
            <strong>Prompt payment:</strong> Clean claims must be paid within
            45 days
          </li>
        </ul>

        <h2>Key Contacts for Pennsylvania Residents</h2>
        <table>
          <thead>
            <tr>
              <th>Agency</th>
              <th>Contact</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>PA Insurance Department</td>
              <td>1-877-881-6388 / insurance.pa.gov</td>
            </tr>
            <tr>
              <td>PA Attorney General (Health Bureau)</td>
              <td>1-800-441-2555 / attorneygeneral.gov</td>
            </tr>
            <tr>
              <td>CMS No Surprises Help Desk (federal)</td>
              <td>1-800-985-3059 / cms.gov/nosurprises</td>
            </tr>
          </tbody>
        </table>

        <h2>The Bottom Line</h2>
        <p>
          Pennsylvania&apos;s two-level internal appeal process plus binding
          external review gives you multiple chances to overturn a denial.
          Act 112&apos;s surprise billing ban and Act 68&apos;s external review
          rights mean you have strong legal backing when your insurer denies
          a legitimate claim.
        </p>
        <p>
          Need help navigating your appeal?{" "}
          <Link href="/auth/signup">BenefitGuard</Link> can analyze your
          denial letter and tell you exactly which Pennsylvania laws protect
          you.
        </p>
      </ArticleLayout>
    </>
  );
}
