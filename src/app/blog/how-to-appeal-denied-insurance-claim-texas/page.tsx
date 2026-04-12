import type { Metadata } from "next";
import Link from "next/link";
import { ArticleLayout } from "@/components/blog/article-layout";
import { getArticleBySlug } from "@/lib/blog";

const article = getArticleBySlug("how-to-appeal-denied-insurance-claim-texas")!;

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

export default function AppealDeniedClaimTexasPage() {
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
          Texas passed one of the first comprehensive surprise billing laws in
          the country — <strong>SB 1264</strong>, effective September 2019 —
          well before the federal No Surprises Act. If your health insurance
          claim was denied in Texas, you have strong protections under both
          state and federal law.
        </p>
        <p>
          This guide covers the specific Texas appeal process, surprise bill
          protections, and the agencies that can help you — on top of the{" "}
          <Link href="/blog/how-to-appeal-denied-health-insurance-claim">
            federal appeal rights
          </Link>{" "}
          every American has under the ACA.
        </p>

        <h2>Texas SB 1264: Surprise Bill Protections</h2>

        <h3>Who Is Protected</h3>
        <ul>
          <li>
            Patients with <strong>state-regulated plans</strong> — individual,
            small group, and large group plans
          </li>
          <li>
            <strong>HMO and PPO</strong> members
          </li>
          <li>
            <strong>Important:</strong> Self-funded employer plans (where your
            employer pays claims directly instead of buying insurance) may NOT
            be covered by Texas state law. These plans are regulated by federal
            law (ERISA) instead. Check your plan documents or ask HR.
          </li>
        </ul>

        <h3>Protected Situations</h3>
        <ol>
          <li>
            <strong>Emergency care at any facility</strong> — regardless of
            whether the hospital or provider is in your network
          </li>
          <li>
            <strong>Out-of-network provider at an in-network facility</strong>{" "}
            — when you had no choice or didn&apos;t receive the required
            disclosures before the service
          </li>
        </ol>

        <h3>Your Responsibility</h3>
        <p>
          In a protected situation, you only owe your{" "}
          <strong>in-network cost-sharing</strong> (copay, coinsurance, or
          deductible amount). The rest is resolved between the provider and
          insurer through Texas&apos;s mediation and arbitration process — you are
          not involved.
        </p>

        <h2>How to Appeal a Denied Claim in Texas</h2>

        <h3>Step 1: Understand the Denial</h3>
        <p>
          Your denial letter must include the specific reason for the denial,
          the clinical criteria used, and instructions for how to appeal. Note
          the claim number and appeal deadline.
        </p>

        <h3>Step 2: File an Internal Appeal</h3>
        <p>
          File with your insurer using the instructions in the denial letter.
          Include:
        </p>
        <ul>
          <li>A clear statement that you are appealing</li>
          <li>Your member ID and claim number</li>
          <li>
            A letter from your doctor explaining why the treatment is medically
            necessary
          </li>
          <li>Supporting medical records and documentation</li>
        </ul>
        <p>
          Texas requires insurers to respond to internal appeals within{" "}
          <strong>30 days</strong> for pre-service claims and{" "}
          <strong>60 days</strong> for post-service claims. Urgent cases must
          be handled within <strong>72 hours</strong>.
        </p>

        <h3>Step 3: Request an Independent Review</h3>
        <p>
          If your internal appeal is denied, Texas law gives you the right to
          an <strong>independent review organization (IRO)</strong> review.
          This is similar to the federal external review but administered by
          the Texas Department of Insurance (TDI).
        </p>
        <ul>
          <li>
            The IRO is an independent third party with no financial ties to
            your insurer
          </li>
          <li>
            The review is <strong>free to you</strong>
          </li>
          <li>
            You can request an IRO review for medical necessity denials,
            experimental treatment denials, and other coverage disputes
          </li>
          <li>
            The IRO&apos;s decision is <strong>binding</strong> on the insurer
          </li>
        </ul>

        <h3>Step 4: Contact TDI</h3>
        <p>
          If you believe your insurer is violating Texas law — including
          surprise billing protections — contact the Texas Department of
          Insurance:
        </p>
        <ul>
          <li>
            <strong>Phone:</strong> 1-800-252-3439
          </li>
          <li>
            <strong>Online:</strong>{" "}
            <a
              href="https://www.tdi.texas.gov/consumer/cpmbalancebilling.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              tdi.texas.gov
            </a>
          </li>
          <li>
            <strong>Filing deadline for surprise bill complaints:</strong> 90
            days from receiving the bill
          </li>
        </ul>

        <h2>If You Receive a Surprise Bill in Texas</h2>
        <p>
          If you receive an out-of-network bill for emergency care or from a
          provider you didn&apos;t choose at an in-network facility:
        </p>
        <ol>
          <li>
            <strong>Don&apos;t pay it yet.</strong> You have time to investigate.
          </li>
          <li>
            <strong>Check if SB 1264 applies</strong> — was it an emergency,
            or were you treated by a provider you didn&apos;t choose at an
            in-network facility?
          </li>
          <li>
            <strong>Call your insurer</strong> and tell them the bill should be
            processed under Texas surprise billing protections. You should only
            owe your in-network cost-sharing.
          </li>
          <li>
            <strong>Contact TDI</strong> if the provider or insurer doesn&apos;t
            cooperate. File a complaint within 90 days.
          </li>
        </ol>

        <h2>Self-Funded Plans: A Critical Distinction</h2>
        <p>
          <strong>
            Texas SB 1264 does not apply to self-funded employer plans.
          </strong>{" "}
          These plans are regulated by federal law (ERISA), not state law. If
          you have a self-funded plan, you&apos;re still protected by the federal{" "}
          <Link href="/blog/no-surprises-act-your-rights">
            No Surprises Act
          </Link>
          , which provides similar protections for emergencies and
          out-of-network providers at in-network facilities.
        </p>
        <p>
          How to check: Your Summary of Benefits and Coverage (SBC) or plan
          documents will say whether the plan is &quot;fully insured&quot; (state law
          applies) or &quot;self-funded&quot; / &quot;self-insured&quot; (federal law applies).
          You can also ask your HR department.
        </p>

        <h2>Key Contacts for Texas Residents</h2>
        <table>
          <thead>
            <tr>
              <th>Agency</th>
              <th>Contact</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Texas Department of Insurance (TDI)</td>
              <td>1-800-252-3439 / tdi.texas.gov</td>
            </tr>
            <tr>
              <td>Office of the Texas Attorney General</td>
              <td>1-800-621-0508 / texasattorneygeneral.gov</td>
            </tr>
            <tr>
              <td>CMS No Surprises Help Desk (federal)</td>
              <td>1-800-985-3059 / cms.gov/nosurprises</td>
            </tr>
          </tbody>
        </table>

        <h2>The Bottom Line</h2>
        <p>
          Texas was ahead of the curve on surprise billing with SB 1264, and
          the state&apos;s independent review process gives you a free, binding
          appeal when your insurer denies care. Between state and federal
          protections, Texas residents have strong tools to fight back against
          unfair denials — but you need to know which law applies to your
          specific plan.
        </p>
        <p>
          Need help figuring out your specific situation?{" "}
          <Link href="/auth/signup">BenefitGuard</Link> can analyze your
          denial letter and tell you whether Texas state law or federal law
          applies — and exactly what to do next.
        </p>
      </ArticleLayout>
    </>
  );
}
