import type { Metadata } from "next";
import Link from "next/link";
import { ArticleLayout } from "@/components/blog/article-layout";
import { getArticleBySlug } from "@/lib/blog";

const article = getArticleBySlug("how-to-appeal-denied-insurance-claim-illinois")!;

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

export default function AppealDeniedClaimIllinoisPage() {
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
          If your health insurance claim was denied in Illinois, you have
          strong protections under <strong>SB 1840</strong> (the state&apos;s
          surprise billing law) and a robust external review process through
          the <strong>Illinois Department of Insurance (DOI)</strong>.
        </p>
        <p>
          This guide covers the specific Illinois appeal process, surprise
          bill protections, and deadlines — on top of the{" "}
          <Link href="/blog/how-to-appeal-denied-health-insurance-claim">
            federal appeal rights
          </Link>{" "}
          every American has under the ACA.
        </p>

        <h2>Illinois Surprise Billing Protections (SB 1840)</h2>
        <p>
          Illinois SB 1840 provides strong protections for state-regulated
          plans (individual, small group, and large group):
        </p>
        <ul>
          <li>
            <strong>Emergency services at out-of-network facilities:</strong>{" "}
            You only pay your in-network cost-sharing amount
          </li>
          <li>
            <strong>Out-of-network providers at in-network facilities:</strong>{" "}
            Protected from balance billing when you didn&apos;t choose the
            provider
          </li>
        </ul>
        <p>
          These protections work alongside the federal{" "}
          <Link href="/blog/no-surprises-act-your-rights">
            No Surprises Act
          </Link>{" "}
          to give Illinois residents double-layer protection.
        </p>

        <h2>External Review Rights</h2>
        <p>
          Illinois offers a strong independent external review process:
        </p>
        <ul>
          <li>
            Available for denials based on{" "}
            <strong>medical necessity</strong>,{" "}
            <strong>experimental treatments</strong>, or{" "}
            <strong>clinical trial coverage</strong>
          </li>
          <li>
            <strong>Filing deadline:</strong> Within 4 months of your final
            internal appeal decision
          </li>
          <li>
            The independent reviewer&apos;s decision is{" "}
            <strong>binding on the insurer</strong>
          </li>
          <li>
            <strong>Expedited review:</strong> Available for urgent situations
            — decision within 72 hours
          </li>
        </ul>

        <h2>Additional Illinois Protections</h2>
        <ul>
          <li>
            <strong>Mental health parity:</strong> Coverage for mental health
            and substance use must be equivalent to medical/surgical benefits
          </li>
          <li>
            <strong>Continuity of care:</strong> 90 days of continued coverage
            at in-network rates when your provider leaves the network during
            active treatment
          </li>
          <li>
            <strong>Prompt payment:</strong> Insurers must pay clean electronic
            claims within 30 days
          </li>
          <li>
            <strong>Telehealth parity:</strong> Insurers must cover telehealth
            services at the same rates as in-person visits
          </li>
        </ul>

        <h2>Step-by-Step: How to Appeal in Illinois</h2>

        <h3>Step 1: Read Your Denial Carefully</h3>
        <p>
          Your denial letter must include the specific reason, clinical
          criteria used, and instructions for appealing. Note the claim
          number, the reviewer&apos;s name if provided, and the deadline.
        </p>

        <h3>Step 2: File an Internal Appeal</h3>
        <p>
          Submit your appeal to your insurer with:
        </p>
        <ul>
          <li>A clear statement that you are appealing the denial</li>
          <li>Your doctor&apos;s letter of medical necessity</li>
          <li>Supporting medical records and documentation</li>
          <li>Any relevant clinical guidelines or peer-reviewed studies</li>
        </ul>

        <h3>Step 3: Request External Review</h3>
        <p>
          If the internal appeal is denied, request an external review within
          4 months. Contact the Illinois DOI:
        </p>
        <ul>
          <li>
            <strong>Phone:</strong> 1-866-445-5364
          </li>
          <li>
            <strong>Online:</strong>{" "}
            <a
              href="https://insurance.illinois.gov/Complaints"
              target="_blank"
              rel="noopener noreferrer"
            >
              insurance.illinois.gov/Complaints
            </a>
          </li>
        </ul>

        <h3>Step 4: File a Complaint If Needed</h3>
        <p>
          If your insurer violates Illinois law — for example, balance billing
          you in a protected situation or failing to meet prompt payment
          deadlines — file a complaint with the DOI.
        </p>

        <h2>Get Covered Illinois</h2>
        <p>
          Illinois has its own state health insurance marketplace:{" "}
          <strong>Get Covered Illinois</strong> (getcovered.illinois.gov). If
          you&apos;re shopping for coverage or need to change plans due to a
          qualifying life event, this is your starting point.
        </p>

        <h2>Key Contacts for Illinois Residents</h2>
        <table>
          <thead>
            <tr>
              <th>Agency</th>
              <th>Contact</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>IL Dept of Insurance</td>
              <td>1-866-445-5364 / insurance.illinois.gov</td>
            </tr>
            <tr>
              <td>Get Covered Illinois (marketplace)</td>
              <td>getcovered.illinois.gov</td>
            </tr>
            <tr>
              <td>CMS No Surprises Help Desk (federal)</td>
              <td>1-800-985-3059 / cms.gov/nosurprises</td>
            </tr>
          </tbody>
        </table>

        <h2>The Bottom Line</h2>
        <p>
          Illinois residents benefit from SB 1840&apos;s surprise billing
          protections, a binding external review process, strong telehealth
          parity, and 90-day continuity of care provisions. Combined with
          federal protections, you have multiple paths to fight an unfair
          denial.
        </p>
        <p>
          Need help with your specific situation?{" "}
          <Link href="/auth/signup">BenefitGuard</Link> can analyze your
          denial letter and tell you exactly which Illinois laws protect you.
        </p>
      </ArticleLayout>
    </>
  );
}
