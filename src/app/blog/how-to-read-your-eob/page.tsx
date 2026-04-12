import type { Metadata } from "next";
import Link from "next/link";
import { ArticleLayout } from "@/components/blog/article-layout";
import { getArticleBySlug } from "@/lib/blog";

const article = getArticleBySlug("how-to-read-your-eob")!;

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

export default function HowToReadYourEOBPage() {
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
          You got a piece of mail from your insurance company. It says
          &quot;Explanation of Benefits&quot; or &quot;EOB&quot; at the top, it&apos;s full of numbers
          and codes, and it looks like a bill. But it&apos;s not — and understanding
          the difference could save you hundreds or even thousands of dollars.
        </p>
        <p>
          According to a{" "}
          <a
            href="https://www.kff.org/medicaid/kff-survey-shows-complexity-red-tape-denials-confusion-rivals-affordability-as-a-problem-for-insured-consumers-with-some-saying-it-caused-them-to-go-without-or-delay-care/"
            target="_blank"
            rel="noopener noreferrer"
          >
            KFF survey
          </a>
          , <strong>30% of insured adults</strong> report difficulty
          understanding what their explanation of benefits statement means. This
          guide changes that.
        </p>

        <h2>What Is an EOB?</h2>
        <p>
          An Explanation of Benefits is a statement from your insurance company
          that shows what happened when a healthcare provider submitted a claim
          on your behalf. It tells you:
        </p>
        <ul>
          <li>What services were provided</li>
          <li>How much the provider charged</li>
          <li>How much your insurance paid (or will pay)</li>
          <li>How much you owe</li>
        </ul>
        <p>
          <strong>An EOB is not a bill.</strong> You&apos;ll receive a separate bill
          from your healthcare provider. The EOB is your insurance company&apos;s
          explanation of how they processed the claim. Think of it as a receipt
          and a scorecard rolled into one.
        </p>

        <h2>Why Your EOB Matters</h2>
        <p>Most people glance at their EOB and throw it away. Don&apos;t.</p>
        <p>Your EOB is your first line of defense against:</p>
        <ul>
          <li>
            <strong>Billing errors</strong> — if the provider bills you for more
            than what the EOB says you owe, that&apos;s a red flag
          </li>
          <li>
            <strong>Denied claims</strong> — the EOB tells you if anything was
            denied and why
          </li>
          <li>
            <strong>Surprise charges</strong> — you can catch out-of-network
            charges or services you didn&apos;t receive
          </li>
          <li>
            <strong>Tracking your deductible</strong> — the EOB shows how much
            you&apos;ve paid toward your annual deductible and out-of-pocket maximum
          </li>
        </ul>

        <h2>How to Read Each Section of Your EOB</h2>
        <p>
          Every insurer formats their EOB slightly differently, but they all
          contain the same core information. Here&apos;s what each section means:
        </p>

        <h3>Patient and Provider Information</h3>
        <p>
          At the top, you&apos;ll see your name (or the patient&apos;s name if you&apos;re
          covering a family member), your member ID, and the name of the
          healthcare provider who submitted the claim. Verify this is correct —
          if the wrong patient or provider is listed, contact your insurer
          immediately.
        </p>

        <h3>Date of Service</h3>
        <p>
          The date you received care. Match this against your own records. If
          you see a date you didn&apos;t visit a provider, that&apos;s a sign of either
          an error or, in rare cases, fraud.
        </p>

        <h3>Service Description and Codes</h3>
        <p>
          A brief description of each service along with CPT codes (procedure
          codes) and sometimes ICD codes (diagnosis codes). You don&apos;t need to
          memorize these, but if something looks wrong — say, you went for a
          routine checkup and the code says &quot;surgery&quot; — flag it.
        </p>

        <h3>Amount Billed (Provider&apos;s Charge)</h3>
        <p>
          This is what the provider charged for the service. This number is
          almost always higher than what your insurance actually pays — it&apos;s the
          provider&apos;s &quot;list price.&quot; Don&apos;t panic when you see a large number
          here.
        </p>

        <h3>Allowed Amount (Negotiated Rate)</h3>
        <p>
          This is the amount your insurance company has agreed to pay for this
          service based on their contract with the provider. For in-network
          providers, this is typically much lower than the billed amount.{" "}
          <strong>This is the number that actually matters.</strong>
        </p>
        <p>
          If the provider is in-network, they cannot charge you more than your
          share of the allowed amount. The difference between the billed amount
          and the allowed amount is written off — you don&apos;t owe it.
        </p>

        <h3>What Insurance Paid</h3>
        <p>
          The portion of the allowed amount that your insurance company paid
          directly to the provider (or will pay). This depends on whether you&apos;ve
          met your{" "}
          <Link href="/blog/health-insurance-terms-explained">deductible</Link>{" "}
          and your plan&apos;s coinsurance or copay structure.
        </p>

        <h3>What You Owe (Your Responsibility)</h3>
        <p>
          This is the amount you&apos;re responsible for paying. It&apos;s typically
          broken into:
        </p>
        <ul>
          <li>
            <strong>Copay</strong> — a flat fee you pay for certain services
            (e.g., $30 for a doctor visit)
          </li>
          <li>
            <strong>Deductible</strong> — the amount applied to your annual
            deductible (you pay this until you hit your deductible limit)
          </li>
          <li>
            <strong>Coinsurance</strong> — your percentage share after the
            deductible is met (e.g., you pay 20%, insurance pays 80%)
          </li>
        </ul>
        <p>
          <strong>
            This &quot;you owe&quot; number on the EOB should match the bill you receive
            from the provider.
          </strong>{" "}
          If the provider bills you for more than what the EOB says you owe,
          call them and reference the EOB. The provider must honor the
          negotiated rate for in-network services.
        </p>

        <h3>Claim Status</h3>
        <p>
          The EOB will show whether the claim was <strong>paid</strong>,{" "}
          <strong>partially paid</strong>, <strong>denied</strong>, or{" "}
          <strong>pending</strong>. If it says denied, look for the reason code
          and description. This is your starting point for an{" "}
          <Link href="/blog/how-to-appeal-denied-health-insurance-claim">
            appeal
          </Link>
          .
        </p>

        <h3>Deductible and Out-of-Pocket Tracking</h3>
        <p>
          Many EOBs include a running total of how much you&apos;ve paid toward
          your annual deductible and out-of-pocket maximum. This is valuable —
          once you hit your out-of-pocket max, your insurance pays 100% of
          covered services for the rest of the year.
        </p>

        <h2>EOB vs. Medical Bill: What&apos;s the Difference?</h2>
        <table>
          <thead>
            <tr>
              <th>EOB</th>
              <th>Medical Bill</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Sent by your insurance company</td>
              <td>Sent by your healthcare provider</td>
            </tr>
            <tr>
              <td>Shows how the claim was processed</td>
              <td>Requests payment from you</td>
            </tr>
            <tr>
              <td>Not a bill — do not pay from this</td>
              <td>This is what you actually pay</td>
            </tr>
            <tr>
              <td>
                Shows allowed amount, insurance payment, and your share
              </td>
              <td>
                Should match the &quot;you owe&quot; amount on the EOB
              </td>
            </tr>
          </tbody>
        </table>
        <p>
          <strong>Rule of thumb:</strong> Never pay a medical bill until you&apos;ve
          received and reviewed the EOB for that service. If you get a bill
          before the EOB arrives, call the provider and ask them to wait until
          insurance has processed the claim.
        </p>

        <h2>Red Flags to Watch For</h2>
        <ol>
          <li>
            <strong>The bill is higher than the EOB says you owe</strong> —
            Call the provider. Reference the EOB. For in-network services,
            they&apos;re contractually required to honor the negotiated rate.
          </li>
          <li>
            <strong>Services you didn&apos;t receive</strong> — If the EOB lists a
            procedure or visit that didn&apos;t happen, contact your insurer. This
            could be a coding error or, in rare cases, fraudulent billing.
          </li>
          <li>
            <strong>A claim was denied</strong> — Don&apos;t ignore this. Read the
            reason code and{" "}
            <Link href="/blog/how-to-appeal-denied-health-insurance-claim">
              start the appeal process
            </Link>
            .
          </li>
          <li>
            <strong>Out-of-network charges you didn&apos;t expect</strong> — If you
            went to an in-network facility but a specific provider (like an
            anesthesiologist) was out of network, the{" "}
            <Link href="/blog/no-surprises-act-your-rights">
              No Surprises Act
            </Link>{" "}
            likely protects you.
          </li>
          <li>
            <strong>Duplicate charges</strong> — The same service appearing
            twice is one of the most common billing errors.
          </li>
        </ol>

        <h2>What to Do If Something Looks Wrong</h2>
        <ol>
          <li>
            <strong>Compare the EOB to the bill line by line</strong> — Every
            service, every dollar amount. They should match.
          </li>
          <li>
            <strong>Call your insurer</strong> — Reference the claim number on
            the EOB and ask them to explain any charges you don&apos;t understand.
          </li>
          <li>
            <strong>Call the provider&apos;s billing department</strong> — If the
            bill doesn&apos;t match the EOB, ask the provider to resubmit or correct
            the charge.
          </li>
          <li>
            <strong>Keep records</strong> — Save every EOB, every bill, and
            notes from every phone call (date, time, who you spoke with, what
            they said).
          </li>
        </ol>

        <h2>The Bottom Line</h2>
        <p>
          Your EOB is the single most important document for protecting
          yourself from overpaying. It takes 5 minutes to read, and it could
          save you hundreds. Get in the habit of reviewing every EOB you
          receive, matching it against the bill, and questioning anything that
          doesn&apos;t add up.
        </p>
        <p>
          You shouldn&apos;t need a medical billing degree to understand what your
          insurance paid for. That&apos;s exactly why we built{" "}
          <Link href="/auth/signup">BenefitGuard</Link> — upload your EOB and
          get a plain-English explanation in seconds.
        </p>
      </ArticleLayout>
    </>
  );
}
