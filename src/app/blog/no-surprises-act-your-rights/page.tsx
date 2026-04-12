import type { Metadata } from "next";
import Link from "next/link";
import { ArticleLayout } from "@/components/blog/article-layout";
import { getArticleBySlug } from "@/lib/blog";

const article = getArticleBySlug("no-surprises-act-your-rights")!;

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

export default function NoSurprisesActPage() {
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
          Before 2022, getting an unexpected medical bill from an
          out-of-network provider you didn&apos;t choose was one of the most common
          — and most devastating — financial surprises in American healthcare.
          You go to an in-network hospital, but the anesthesiologist is out of
          network. You end up in the ER and the hospital isn&apos;t in your plan. A
          lab sends your bloodwork to an out-of-network facility.
        </p>
        <p>
          The <strong>No Surprises Act</strong>, which took effect on January
          1, 2022, changed the rules. Here&apos;s what it means for you, what it
          covers, what it doesn&apos;t, and exactly what to do if you still get a
          surprise bill.
        </p>

        <h2>What the No Surprises Act Does</h2>
        <p>
          The No Surprises Act protects you from unexpected medical bills in
          specific situations where you had no choice about the provider. The
          core protections:
        </p>

        <h3>1. Emergency Services</h3>
        <p>
          If you go to an emergency room — any emergency room — you are
          protected regardless of whether the hospital or the doctors treating
          you are in your network.
        </p>
        <ul>
          <li>
            You pay only your <strong>in-network cost-sharing amount</strong>{" "}
            (copay, coinsurance, or deductible) — even if the hospital and
            every provider there is out of network
          </li>
          <li>
            The out-of-network provider <strong>cannot balance bill you</strong>{" "}
            for the difference between their charge and what your insurance pays
          </li>
          <li>
            This protection applies to the emergency visit itself and any{" "}
            <strong>post-stabilization care</strong> — the care you receive
            after being stabilized, until you&apos;re able to be safely transferred
            or discharged
          </li>
        </ul>
        <p>
          <strong>What this means in practice:</strong> If your plan has a $250
          ER copay and you go to an out-of-network emergency room, you pay
          $250. Not the $8,000 the ER bills. Your insurance and the provider
          work out the rest between themselves.
        </p>

        <h3>2. Out-of-Network Providers at In-Network Facilities</h3>
        <p>
          If you go to a hospital or surgical center that&apos;s in your network,
          but one of the providers treating you is out of network — and you
          didn&apos;t choose that provider — you&apos;re protected.
        </p>
        <p>Common scenarios this covers:</p>
        <ul>
          <li>
            An out-of-network <strong>anesthesiologist</strong> during surgery
            at an in-network hospital
          </li>
          <li>
            An out-of-network <strong>radiologist</strong> reading your imaging
            at an in-network facility
          </li>
          <li>
            An out-of-network <strong>pathologist</strong> analyzing your lab
            work
          </li>
          <li>
            An out-of-network <strong>assistant surgeon</strong> you didn&apos;t
            request
          </li>
        </ul>
        <p>
          Again, you pay only your in-network cost-sharing amount. The
          provider and insurer resolve the payment dispute through the
          Independent Dispute Resolution (IDR) process — you&apos;re not involved.
        </p>

        <h3>3. Good Faith Estimates (For Uninsured/Self-Pay Patients)</h3>
        <p>
          If you don&apos;t have insurance or choose to pay out of pocket, you have
          the right to a <strong>Good Faith Estimate</strong> of the cost
          before receiving non-emergency care.
        </p>
        <ul>
          <li>
            Providers must give you a written estimate that includes all
            expected charges — not just the main provider, but labs, imaging,
            anesthesia, facility fees, etc.
          </li>
          <li>
            If the final bill exceeds the estimate by <strong>$400 or more</strong>,
            you can dispute it through the federal Patient-Provider Dispute
            Resolution process
          </li>
        </ul>

        <h2>What the No Surprises Act Does NOT Cover</h2>
        <p>
          The law has significant gaps. You are <strong>not protected</strong>{" "}
          in these situations:
        </p>

        <h3>Ground Ambulances</h3>
        <p>
          This is the biggest gap. Ground ambulance services are explicitly
          excluded from the No Surprises Act. If you take a ground ambulance
          that&apos;s out of network, you can still receive a surprise bill. (Air
          ambulances ARE covered by the law.)
        </p>
        <p>
          Some states have their own surprise billing laws that cover ground
          ambulances. Check your state&apos;s protections.
        </p>

        <h3>Non-Emergency Care Where You Consent</h3>
        <p>
          If you <em>voluntarily choose</em> to see an out-of-network provider
          for non-emergency care, the No Surprises Act doesn&apos;t apply. However,
          for certain non-emergency services at in-network facilities, the
          out-of-network provider must:
        </p>
        <ol>
          <li>
            Give you written notice at least 72 hours before the service that
            they&apos;re out of network
          </li>
          <li>
            Provide an estimate of what you&apos;ll be charged
          </li>
          <li>
            Get your written consent to waive your surprise billing protections
          </li>
        </ol>
        <p>
          <strong>Important:</strong> You can always refuse to sign this waiver.
          If you refuse, the provider must either find an in-network alternative
          or treat you at the in-network rate. Never feel pressured to sign.
        </p>

        <h3>Short-Term and Some Other Plan Types</h3>
        <p>
          Short-term health insurance plans and certain grandfathered plans may
          not be subject to all No Surprises Act provisions. If you have a
          non-ACA-compliant plan, your protections may be more limited.
        </p>

        <h2>What to Do If You Get a Surprise Bill</h2>
        <p>
          Despite the law, surprise bills still happen — because of billing
          errors, providers who ignore the law, or situations that fall into
          the gaps. Here&apos;s what to do:
        </p>

        <h3>Step 1: Don&apos;t Pay It Yet</h3>
        <p>
          If you receive an unexpected out-of-network bill, do not pay
          immediately. You have time to investigate.
        </p>

        <h3>Step 2: Check If the No Surprises Act Applies</h3>
        <p>Ask yourself:</p>
        <ul>
          <li>Was this an emergency? → You&apos;re protected.</li>
          <li>
            Was the out-of-network provider at an in-network facility, and I
            didn&apos;t choose them? → You&apos;re protected.
          </li>
          <li>
            Did I sign a written consent to waive my protections? → If yes,
            the law may not help. If no, you&apos;re protected.
          </li>
          <li>
            Is this a ground ambulance bill? → The federal law doesn&apos;t cover
            this (check your state).
          </li>
        </ul>

        <h3>Step 3: Contact Your Insurance Company</h3>
        <p>
          Call the number on the back of your insurance card and say:
        </p>
        <blockquote>
          &quot;I received an out-of-network bill for [service] on [date]. I believe
          this is a surprise bill covered by the No Surprises Act. Can you
          confirm that this should be processed at my in-network cost-sharing
          rate?&quot;
        </blockquote>
        <p>
          Your insurer should reprocess the claim. If they confirm the No
          Surprises Act applies, you should only owe your in-network amount.
        </p>

        <h3>Step 4: Contact the Provider</h3>
        <p>
          Tell the provider&apos;s billing department that the charge is subject to
          the No Surprises Act and that they cannot balance bill you. Reference
          the law by name. Most providers will correct the bill once they
          realize you know your rights.
        </p>

        <h3>Step 5: File a Complaint If Necessary</h3>
        <p>
          If the provider refuses to adjust the bill, you have two options:
        </p>
        <ul>
          <li>
            <strong>
              File a complaint with the Centers for Medicare &amp; Medicaid
              Services (CMS)
            </strong>{" "}
            at{" "}
            <a
              href="https://www.cms.gov/nosurprises/consumers"
              target="_blank"
              rel="noopener noreferrer"
            >
              cms.gov/nosurprises
            </a>{" "}
            or call 1-800-985-3059
          </li>
          <li>
            <strong>
              File a complaint with your state&apos;s Department of Insurance
            </strong>{" "}
            — many states have their own surprise billing enforcement and may
            be faster to respond
          </li>
        </ul>
        <p>
          Providers who violate the No Surprises Act face penalties of up to
          $10,000 per violation. The law has teeth — use it.
        </p>

        <h2>The Independent Dispute Resolution (IDR) Process</h2>
        <p>
          You don&apos;t need to understand the IDR process in detail — it&apos;s
          primarily a mechanism for providers and insurers to resolve payment
          disputes between themselves. But here&apos;s the quick version:
        </p>
        <ul>
          <li>
            When a surprise billing situation arises, the insurer pays the
            provider an initial amount
          </li>
          <li>
            If the provider thinks that&apos;s too low, either party can initiate
            IDR — an independent arbitrator decides the final payment amount
          </li>
          <li>
            <strong>
              You, the patient, are not part of this process
            </strong>{" "}
            — you&apos;ve already paid your in-network cost-sharing, and the rest is
            between the provider and insurer
          </li>
        </ul>

        <h2>State Surprise Billing Laws</h2>
        <p>
          Many states had their own surprise billing protections before the
          federal law. Some offer stronger protections than the federal law,
          particularly for ground ambulances and state-regulated insurance
          plans. States with notable protections include:
        </p>
        <ul>
          <li>
            <strong>New York</strong> — One of the first states to ban surprise
            billing (2015). Covers ground ambulances.
          </li>
          <li>
            <strong>California</strong> — Comprehensive protections including
            ground ambulances and non-emergency care.
          </li>
          <li>
            <strong>Texas</strong> — Strong protections for emergency care and
            out-of-network providers at in-network facilities.
          </li>
          <li>
            <strong>Florida</strong> — Protections for emergency services and
            non-emergency surgical or ancillary services.
          </li>
        </ul>
        <p>
          The federal No Surprises Act acts as a floor — your state&apos;s law
          applies if it provides stronger protections.
        </p>

        <h2>The Bottom Line</h2>
        <p>
          The No Surprises Act is one of the most important consumer
          protections in healthcare in decades. If you end up in an emergency
          or get treated by an out-of-network provider you didn&apos;t choose at an
          in-network facility, <strong>you should only pay your in-network
          rate.</strong> Period.
        </p>
        <p>
          Know your rights. Don&apos;t pay a surprise bill without checking first.
          And if a provider tries to balance bill you in a protected
          situation, push back — the law is on your side.
        </p>
        <p>
          Need help figuring out whether the No Surprises Act applies to your
          specific bill?{" "}
          <Link href="/auth/signup">BenefitGuard</Link> can analyze your
          documents and tell you exactly which laws protect you — in seconds.
        </p>
      </ArticleLayout>
    </>
  );
}
