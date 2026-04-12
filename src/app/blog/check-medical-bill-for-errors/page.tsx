import type { Metadata } from "next";
import Link from "next/link";
import { ArticleLayout } from "@/components/blog/article-layout";
import { getArticleBySlug } from "@/lib/blog";

const article = getArticleBySlug("check-medical-bill-for-errors")!;

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

export default function CheckMedicalBillPage() {
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
          Medical billing advocates report that up to 80% of hospital bills
          contain errors. Even conservative estimates put the rate at 30–40%.
          With nearly 70,000 diagnosis codes and over 71,000 procedure codes in
          the medical billing system, mistakes are inevitable.
        </p>
        <p>
          The problem? <strong>Most people never check.</strong> A survey by
          Gitnux found that 32% of patients pay a bill immediately just to
          avoid the confusion, even if they suspect it might be wrong. And 72%
          don&apos;t know how to dispute a billing error.
        </p>
        <p>
          This 7-point checklist gives you a simple, repeatable process for
          reviewing any medical bill before you pay a cent.
        </p>

        <h2>Before You Start: Get the Right Documents</h2>
        <p>You need two things to audit a medical bill:</p>
        <ol>
          <li>
            <strong>The bill itself</strong> — the statement from your
            healthcare provider asking for payment
          </li>
          <li>
            <strong>
              Your{" "}
              <Link href="/blog/how-to-read-your-eob">
                Explanation of Benefits (EOB)
              </Link>
            </strong>{" "}
            — the statement from your insurance company showing how the claim
            was processed
          </li>
        </ol>
        <p>
          <strong>Never pay a bill before the EOB arrives.</strong> If a
          provider sends you a bill before your insurance has processed the
          claim, call them and ask them to wait. You need the EOB to verify
          that the bill is correct.
        </p>

        <h2>The 7-Point Medical Bill Audit Checklist</h2>

        <h3>1. Does the Bill Match the EOB?</h3>
        <p>
          Compare the &quot;patient responsibility&quot; amount on your EOB to the
          amount on the provider&apos;s bill. They should match. If the bill is
          higher than what the EOB says you owe, the provider is overcharging
          you.
        </p>
        <p>
          For in-network providers, the allowed amount on the EOB is the
          maximum the provider can charge. They are contractually required to
          write off the difference between their list price and the negotiated
          rate.
        </p>

        <h3>2. Are There Duplicate Charges?</h3>
        <p>
          This is the single most common billing error. Look for the same
          service, same date, same CPT code appearing twice. This happens more
          often than you&apos;d think — especially after hospital stays, where
          billing departments process hundreds of charges per patient.
        </p>
        <p>
          Check for subtle duplicates too: sometimes the same service is billed
          under slightly different descriptions or codes but is essentially the
          same charge.
        </p>

        <h3>3. Were You Billed for Services You Didn&apos;t Receive?</h3>
        <p>
          These are sometimes called &quot;phantom charges.&quot; Common examples:
        </p>
        <ul>
          <li>
            Operating room time that exceeds what you were actually in surgery
          </li>
          <li>Supplies that were opened but not used on you</li>
          <li>A room upgrade you didn&apos;t request</li>
          <li>Tests that were ordered but never performed</li>
        </ul>
        <p>
          If you see anything you don&apos;t recognize, call the billing department
          and ask them to explain each charge. You have the right to an
          itemized bill — always request one.
        </p>

        <h3>4. Is the Billing Code Correct?</h3>
        <p>
          <strong>Upcoding</strong> is when a provider bills for a more
          expensive procedure than what was actually performed. For example:
        </p>
        <ul>
          <li>
            A 15-minute office visit coded as a &quot;comprehensive exam&quot;
          </li>
          <li>
            A standard X-ray coded as a more complex imaging study
          </li>
          <li>
            A generic medication billed at the brand-name price
          </li>
        </ul>
        <p>
          You don&apos;t need to be a coding expert to catch this. If the
          description on the bill doesn&apos;t match what actually happened during
          your visit, ask the provider to review and correct the code.
        </p>

        <h3>5. Is the Provider In-Network?</h3>
        <p>
          Check whether the provider listed on the bill is in your insurance
          plan&apos;s network. If they are in-network, they cannot{" "}
          <strong>balance bill</strong> you — meaning they can&apos;t charge you
          the difference between their list price and the insurance-negotiated
          rate.
        </p>
        <p>
          If you received care at an in-network facility but one of the
          providers (like an anesthesiologist or radiologist) was out of
          network, the{" "}
          <Link href="/blog/no-surprises-act-your-rights">
            No Surprises Act
          </Link>{" "}
          likely protects you from the excess charges.
        </p>

        <h3>6. Is the Amount Above the &quot;Allowed Amount&quot;?</h3>
        <p>
          Your EOB shows the <strong>allowed amount</strong> — what your
          insurance considers the reasonable cost for each service. If the
          provider&apos;s bill exceeds the allowed amount for in-network services,
          something is wrong.
        </p>
        <p>
          For out-of-network services where the No Surprises Act doesn&apos;t
          apply, you may be responsible for the difference. But even then, you
          can negotiate. Providers will often accept the allowed amount or
          somewhere in between if you call and negotiate directly.
        </p>

        <h3>7. Did You Receive a Surprise Bill?</h3>
        <p>
          A surprise bill is an unexpected charge from an out-of-network
          provider, typically one you didn&apos;t choose. Common scenarios:
        </p>
        <ul>
          <li>Emergency room care at any hospital</li>
          <li>
            An out-of-network specialist at an in-network hospital (you didn&apos;t
            pick them)
          </li>
          <li>Air ambulance services</li>
        </ul>
        <p>
          The{" "}
          <Link href="/blog/no-surprises-act-your-rights">
            No Surprises Act (2022)
          </Link>{" "}
          makes most surprise bills illegal. If you receive one, you should
          only owe your normal in-network cost-sharing amount (copay,
          coinsurance, or deductible). If the bill is higher, dispute it.
        </p>

        <h2>What to Do When You Find an Error</h2>

        <h3>Step 1: Request an Itemized Bill</h3>
        <p>
          Call the provider&apos;s billing department and say: &quot;I&apos;d like a fully
          itemized bill showing every charge, service code, and date of
          service.&quot; You have the right to this. Many initial bills only show a
          lump sum — the itemized version is where errors become visible.
        </p>

        <h3>Step 2: Call the Billing Department</h3>
        <p>Use this script:</p>
        <blockquote>
          &quot;I&apos;m reviewing my bill for [date of service] and I&apos;ve found what
          appears to be an error. Specifically, [describe the issue — duplicate
          charge, wrong code, service not received, etc.]. Can you review this
          and correct it? My account number is [X].&quot;
        </blockquote>
        <p>
          Write down the name of the person you speak with, the date, and what
          they say. If they agree to correct it, ask for a corrected bill in
          writing.
        </p>

        <h3>Step 3: Escalate If Necessary</h3>
        <p>If the billing department won&apos;t correct a clear error:</p>
        <ul>
          <li>
            <strong>Ask for a supervisor</strong> — billing reps can&apos;t always
            override charges
          </li>
          <li>
            <strong>File a formal dispute in writing</strong> — send a letter
            describing the error and requesting correction. Send it certified
            mail so you have proof of delivery.
          </li>
          <li>
            <strong>
              Contact your state&apos;s Department of Insurance
            </strong>{" "}
            — if the provider refuses to correct a billing error, your state
            regulator can investigate
          </li>
          <li>
            <strong>
              Mention your state&apos;s consumer protection statute
            </strong>{" "}
            — the sentence &quot;I&apos;d like to request a review of this charge under
            [your state]&apos;s consumer protection statute&quot; gets attention
          </li>
        </ul>

        <h2>Can You Negotiate a Medical Bill?</h2>
        <p>
          Yes. Even if the bill is technically correct, you can almost always
          negotiate. Providers would rather get partial payment than send you
          to collections. Common negotiation strategies:
        </p>
        <ul>
          <li>
            <strong>Ask for the cash price</strong> — many providers offer a
            discount (often 20–40%) if you pay in full without going through
            insurance
          </li>
          <li>
            <strong>Request a payment plan</strong> — most providers will set
            up interest-free monthly payments
          </li>
          <li>
            <strong>Ask about financial assistance</strong> — nonprofit
            hospitals are legally required to have charity care programs
          </li>
          <li>
            <strong>Reference fair pricing</strong> — look up the fair price
            for your procedure on{" "}
            <a
              href="https://www.fairhealthconsumer.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              FAIR Health Consumer
            </a>{" "}
            and use that as your negotiation benchmark
          </li>
        </ul>

        <h2>The Bottom Line</h2>
        <p>
          Never pay a medical bill without checking it first.{" "}
          <strong>
            Five minutes with this checklist could save you hundreds or
            thousands of dollars.
          </strong>{" "}
          The billing system is complex, mistakes are common, and the only
          person who&apos;s going to catch those mistakes is you.
        </p>
        <p>
          Want help? <Link href="/auth/signup">BenefitGuard</Link> can read
          your medical bills and EOBs and flag potential errors automatically —
          no billing expertise required.
        </p>
      </ArticleLayout>
    </>
  );
}
