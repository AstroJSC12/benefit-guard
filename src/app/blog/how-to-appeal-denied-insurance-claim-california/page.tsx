import type { Metadata } from "next";
import Link from "next/link";
import { ArticleLayout } from "@/components/blog/article-layout";
import { getArticleBySlug } from "@/lib/blog";

const article = getArticleBySlug("how-to-appeal-denied-insurance-claim-california")!;

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

export default function AppealDeniedClaimCaliforniaPage() {
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
          California has one of the most powerful insurance appeal tools in
          the country: the <strong>Independent Medical Review (IMR)</strong>.
          It&apos;s free, it&apos;s binding on your insurer, and it&apos;s decided by a
          physician who specializes in your condition — not by the insurance
          company that denied you.
        </p>
        <p>
          If your health insurance claim was denied in California, this guide
          covers the specific state protections, agencies, and deadlines that
          apply to you — on top of the{" "}
          <Link href="/blog/how-to-appeal-denied-health-insurance-claim">
            federal appeal rights
          </Link>{" "}
          every American has under the ACA.
        </p>

        <h2>California&apos;s Independent Medical Review (IMR)</h2>
        <p>
          The IMR is administered by the{" "}
          <strong>
            Department of Managed Health Care (DMHC)
          </strong>{" "}
          and is available for HMO and some PPO plans regulated by the DMHC.
          It is the single most powerful tool California residents have when
          fighting a denial.
        </p>

        <h3>What the IMR Covers</h3>
        <ul>
          <li>
            <strong>Medical necessity denials</strong> — your insurer says the
            treatment isn&apos;t needed
          </li>
          <li>
            <strong>Experimental or investigational treatment denials</strong>{" "}
            — your insurer says the treatment isn&apos;t proven
          </li>
          <li>
            <strong>Delayed or modified services</strong> — your insurer
            approved something different from what your doctor recommended
          </li>
        </ul>

        <h3>How the IMR Works</h3>
        <ol>
          <li>
            You file a complaint with the DMHC (online, by phone, or by mail)
          </li>
          <li>
            The DMHC assigns your case to an independent medical reviewer —
            a physician who specializes in your condition and has{" "}
            <strong>no relationship with your insurer</strong>
          </li>
          <li>
            The reviewer examines your medical records, your doctor&apos;s
            recommendation, and the insurer&apos;s denial rationale
          </li>
          <li>
            The decision is issued within <strong>30 days</strong> (or{" "}
            <strong>72 hours</strong> for urgent cases)
          </li>
          <li>
            The decision is <strong>binding on the insurer</strong> — if the
            reviewer overturns the denial, your insurer must cover the
            treatment
          </li>
        </ol>

        <h3>Key Details</h3>
        <ul>
          <li>
            <strong>Cost:</strong> Free to you
          </li>
          <li>
            <strong>Filing deadline:</strong> Within 6 months of the denial
          </li>
          <li>
            <strong>Who qualifies:</strong> Members of DMHC-regulated plans
            (most HMOs and some PPOs). If your plan is regulated by the
            California Department of Insurance (CDI) instead, you use a
            similar but separate external review process through the CDI.
          </li>
        </ul>

        <h2>California&apos;s Timely Access to Care Requirements</h2>
        <p>
          California law requires your health plan to provide access to care
          within specific timeframes. If your plan can&apos;t meet these timelines,
          you may be able to see an out-of-network provider at in-network
          rates:
        </p>
        <table>
          <thead>
            <tr>
              <th>Type of Care</th>
              <th>Maximum Wait Time</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Urgent care</td>
              <td>48 hours</td>
            </tr>
            <tr>
              <td>Non-urgent primary care</td>
              <td>10 business days</td>
            </tr>
            <tr>
              <td>Non-urgent specialist</td>
              <td>15 business days</td>
            </tr>
            <tr>
              <td>Mental health (non-urgent)</td>
              <td>10 business days</td>
            </tr>
          </tbody>
        </table>
        <p>
          If your insurer denies care because of scheduling delays or network
          limitations, cite these timely access requirements in your appeal.
        </p>

        <h2>Additional California Protections</h2>
        <ul>
          <li>
            <strong>Grievance response:</strong> Plans must respond to
            grievances within 30 days
          </li>
          <li>
            <strong>Emergency services:</strong> Cannot require prior
            authorization for emergency care
          </li>
          <li>
            <strong>Mental health parity:</strong> Equal coverage for mental
            health services, enforced by the DMHC
          </li>
          <li>
            <strong>Continuity of care:</strong> If your provider leaves your
            plan&apos;s network during active treatment, you can continue care at
            in-network rates during a transition period
          </li>
          <li>
            <strong>Surprise bill protections:</strong> California&apos;s AB 72 and
            the federal{" "}
            <Link href="/blog/no-surprises-act-your-rights">
              No Surprises Act
            </Link>{" "}
            both protect you from balance billing in emergencies and at
            in-network facilities. California&apos;s law also covers ground
            ambulances, which the federal law does not.
          </li>
        </ul>

        <h2>Step-by-Step: How to Appeal in California</h2>

        <h3>Step 1: File a Grievance With Your Plan</h3>
        <p>
          Before going to the DMHC, you must first file a grievance (internal
          appeal) with your health plan. Your denial letter will include
          instructions. The plan has 30 days to respond.
        </p>

        <h3>Step 2: If Denied, Contact the DMHC</h3>
        <p>
          If your internal grievance is denied — or if your plan doesn&apos;t
          respond within 30 days — contact the DMHC:
        </p>
        <ul>
          <li>
            <strong>Online:</strong>{" "}
            <a
              href="https://www.dmhc.ca.gov/FileaComplaint.aspx"
              target="_blank"
              rel="noopener noreferrer"
            >
              dmhc.ca.gov/FileaComplaint
            </a>
          </li>
          <li>
            <strong>Phone:</strong> 1-888-466-2219
          </li>
        </ul>
        <p>
          The DMHC will first try to resolve your issue directly with the
          plan. If that fails, they&apos;ll refer your case to an Independent
          Medical Review.
        </p>

        <h3>Step 3: Independent Medical Review</h3>
        <p>
          Provide all supporting documentation: your doctor&apos;s letter of
          medical necessity, medical records, lab results, and any
          peer-reviewed studies supporting the treatment. The reviewer will
          make a decision within 30 days (72 hours for urgent cases).
        </p>

        <h3>Step 4: If Still Unresolved</h3>
        <p>
          If you believe your plan is violating California law, you can also
          file a complaint with:
        </p>
        <ul>
          <li>
            <strong>California Department of Insurance (CDI)</strong> — for
            PPO plans not regulated by DMHC:{" "}
            <a
              href="https://www.insurance.ca.gov"
              target="_blank"
              rel="noopener noreferrer"
            >
              insurance.ca.gov
            </a>
            , 1-800-927-4357
          </li>
          <li>
            <strong>California Attorney General</strong> — for patterns of
            abuse or fraud
          </li>
        </ul>

        <h2>DMHC vs. CDI: Which Agency Regulates Your Plan?</h2>
        <table>
          <thead>
            <tr>
              <th>Plan Type</th>
              <th>Regulated By</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>HMO plans</td>
              <td>DMHC</td>
            </tr>
            <tr>
              <td>Some PPO plans</td>
              <td>DMHC</td>
            </tr>
            <tr>
              <td>Other PPO/indemnity plans</td>
              <td>CDI</td>
            </tr>
            <tr>
              <td>Self-funded employer plans</td>
              <td>Federal (DOL) — not state-regulated</td>
            </tr>
          </tbody>
        </table>
        <p>
          Check your insurance card or Summary of Benefits — it will typically
          say whether the plan is regulated by the DMHC or CDI. If you&apos;re
          unsure, call either agency and they&apos;ll direct you.
        </p>

        <h2>Key Contacts for California Residents</h2>
        <table>
          <thead>
            <tr>
              <th>Agency</th>
              <th>Contact</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>DMHC (HMO / managed care)</td>
              <td>1-888-466-2219 / dmhc.ca.gov</td>
            </tr>
            <tr>
              <td>CDI (PPO / indemnity)</td>
              <td>1-800-927-4357 / insurance.ca.gov</td>
            </tr>
            <tr>
              <td>CMS No Surprises Help Desk (federal)</td>
              <td>1-800-985-3059 / cms.gov/nosurprises</td>
            </tr>
          </tbody>
        </table>

        <h2>The Bottom Line</h2>
        <p>
          California&apos;s Independent Medical Review is your most powerful
          weapon against an unfair denial. It&apos;s free, binding, and decided by
          an independent specialist — not by the insurer that denied you.
          Combined with the state&apos;s strong timely access and mental health
          parity requirements, California residents have more tools to fight
          back than almost anyone in the country.
        </p>
        <p>
          Need help figuring out your next step?{" "}
          <Link href="/auth/signup">BenefitGuard</Link> can analyze your
          denial letter and tell you exactly which California laws and
          agencies can help.
        </p>
      </ArticleLayout>
    </>
  );
}
