import type { Metadata } from "next";
import Link from "next/link";
import { ArticleLayout } from "@/components/blog/article-layout";
import { getArticleBySlug } from "@/lib/blog";

const article = getArticleBySlug("how-to-appeal-denied-insurance-claim-georgia")!;

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

export default function AppealDeniedClaimGeorgiaPage() {
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
          If your health insurance claim was denied in Georgia, you have
          protections under <strong>HB 888</strong> (Georgia&apos;s surprise
          billing law) and the right to external review through the{" "}
          <strong>
            Office of Insurance and Safety Fire Commissioner
          </strong>
          . Georgia also benefits from the fastest prompt payment rules in
          the country.
        </p>
        <p>
          This guide covers the specific Georgia appeal process, surprise
          bill protections, and deadlines — on top of the{" "}
          <Link href="/blog/how-to-appeal-denied-health-insurance-claim">
            federal appeal rights
          </Link>{" "}
          every American has under the ACA.
        </p>

        <h2>Georgia&apos;s Surprise Billing Law (HB 888)</h2>
        <p>
          Georgia HB 888 protects patients with state-regulated plans from
          surprise medical bills:
        </p>
        <ul>
          <li>
            <strong>Emergency services:</strong> Prohibits balance billing at
            any facility, regardless of network status
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
          for comprehensive coverage.
        </p>

        <h2>External Review Rights</h2>
        <p>
          Georgia law gives you the right to independent external review for
          denials based on medical necessity:
        </p>
        <ul>
          <li>
            The external reviewer&apos;s decision is{" "}
            <strong>binding on the insurer</strong>
          </li>
          <li>
            <strong>Filing deadline:</strong> Within 4 months of your final
            internal appeal decision
          </li>
          <li>
            <strong>Expedited review:</strong> Available for urgent situations
          </li>
        </ul>

        <h2>Prompt Payment — Georgia&apos;s Strongest Protection</h2>
        <p>
          Georgia has one of the fastest prompt payment requirements in the
          country:
        </p>
        <ul>
          <li>
            <strong>Clean claims must be paid within 15 working days</strong>
          </li>
        </ul>
        <p>
          If your insurer is delaying payment on a clean claim beyond 15
          working days, they&apos;re violating Georgia law. Document the
          timeline and cite this requirement.
        </p>

        <h2>Step-by-Step: How to Appeal in Georgia</h2>

        <h3>Step 1: Understand Your Denial</h3>
        <p>
          Your denial letter must explain the specific reason, the clinical
          criteria used, and instructions for appealing. Note the claim number
          and deadline.
        </p>

        <h3>Step 2: File an Internal Appeal</h3>
        <p>
          Follow your plan&apos;s internal appeal process, typically within{" "}
          <strong>180 days</strong> of the denial. Include:
        </p>
        <ul>
          <li>A clear statement that you are appealing the denial</li>
          <li>Your doctor&apos;s letter of medical necessity</li>
          <li>Supporting medical records and documentation</li>
          <li>Any relevant clinical guidelines</li>
        </ul>

        <h3>Step 3: Request External Review</h3>
        <p>
          After the internal appeal is denied, request an external review
          within 4 months. Contact the Georgia Office of Insurance and Safety
          Fire Commissioner:
        </p>
        <ul>
          <li>
            <strong>Phone:</strong> 1-800-656-2298
          </li>
          <li>
            <strong>Online:</strong>{" "}
            <a
              href="https://oci.georgia.gov"
              target="_blank"
              rel="noopener noreferrer"
            >
              oci.georgia.gov
            </a>
          </li>
          <li>
            Complaints can be filed by phone, mail, or online
          </li>
        </ul>

        <h3>Step 4: File a Complaint</h3>
        <p>
          If your insurer violates Georgia law — including surprise billing
          you in a protected situation, failing to meet prompt payment
          deadlines, or not processing your appeal properly — file a formal
          complaint with the Insurance Commissioner.
        </p>

        <h2>Consumer Rights in Georgia</h2>
        <ul>
          <li>
            <strong>Right to appeal:</strong> Both internal and external
            appeals for denied claims
          </li>
          <li>
            <strong>Right to information:</strong> Request details about your
            plan benefits, network providers, and coverage decisions
          </li>
          <li>
            <strong>Continuity of care:</strong> Provisions when transitioning
            between health plans
          </li>
          <li>
            <strong>Right to file complaints:</strong> The Insurance
            Commissioner is required to investigate
          </li>
        </ul>

        <h2>Important: Georgia&apos;s Medicaid Situation</h2>
        <p>
          Georgia has <strong>not expanded Medicaid</strong> under the ACA,
          though limited Medicaid pathways exist for specific populations
          (pregnant women, children, disabled individuals). Georgia uses the
          federal marketplace at <strong>healthcare.gov</strong> for
          individual coverage. If you&apos;re shopping for a plan, you may
          qualify for premium subsidies.
        </p>

        <h2>Key Contacts for Georgia Residents</h2>
        <table>
          <thead>
            <tr>
              <th>Agency</th>
              <th>Contact</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>GA Insurance Commissioner</td>
              <td>1-800-656-2298 / oci.georgia.gov</td>
            </tr>
            <tr>
              <td>GA Attorney General (Consumer Protection)</td>
              <td>1-404-651-8600 / law.georgia.gov</td>
            </tr>
            <tr>
              <td>CMS No Surprises Help Desk (federal)</td>
              <td>1-800-985-3059 / cms.gov/nosurprises</td>
            </tr>
          </tbody>
        </table>

        <h2>The Bottom Line</h2>
        <p>
          Georgia&apos;s HB 888 surprise billing protections, binding external
          review, and nation-leading 15-day prompt payment requirement give
          you real leverage against unfair denials. Combined with federal
          protections, Georgia residents have multiple tools to fight back.
        </p>
        <p>
          Need help with your denial?{" "}
          <Link href="/auth/signup">BenefitGuard</Link> can analyze your
          denial letter and tell you exactly which Georgia laws and agencies
          can help your specific situation.
        </p>
      </ArticleLayout>
    </>
  );
}
