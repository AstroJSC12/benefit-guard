import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function DisclaimersPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-3xl space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Disclaimers</h1>
          <p className="text-sm text-muted-foreground">Last updated: February 2026</p>
        </header>

        <section className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div>
              <h2 className="text-base font-semibold">Emergency Notice</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                BenefitGuard is not an emergency service. If you believe you are experiencing a medical emergency,
                call 911 (or your local emergency number) immediately.
              </p>
            </div>
          </div>
        </section>

        <article className="prose prose-slate max-w-none dark:prose-invert prose-headings:scroll-mt-24">
          <h2>Not Medical Advice</h2>
          <p>
            BenefitGuard does not provide medical advice, diagnosis, treatment recommendations, or prescriptions.
            Content in this app is informational and educational only. Always seek the guidance of licensed healthcare
            professionals for medical decisions.
          </p>

          <h2>Not Legal Advice</h2>
          <p>
            BenefitGuard may summarize insurance rules, regulations, and healthcare laws, but we do not provide legal
            advice or legal representation. Nothing in the app creates an attorney-client relationship. Consult a
            qualified attorney for legal counsel.
          </p>

          <h2>Not Financial Advice</h2>
          <p>
            Any premium, deductible, out-of-pocket, or bill-related estimate is provided for general informational
            purposes only. BenefitGuard does not provide financial planning, tax advice, or investment advice. Consult
            a licensed financial professional for financial decisions.
          </p>

          <h2>AI Limitations</h2>
          <p>
            BenefitGuard uses artificial intelligence to generate responses. AI outputs can be incomplete, inaccurate,
            outdated, or misinterpreted. The model may omit key details, misunderstand context, or provide results that
            are not applicable to your specific plan or location.
          </p>

          <h2>No Guarantee of Accuracy</h2>
          <p>
            Insurance plans, provider networks, coding rules, and legal requirements frequently change. We do not
            guarantee that information in the app is always accurate, complete, or current.
          </p>

          <h2>User Responsibility</h2>
          <p>
            You are responsible for verifying all information before taking action. Confirm plan terms, benefits,
            denials, prior-authorization requirements, and billing details directly with your insurer, provider,
            employer plan administrator, or relevant government agency.
          </p>

          <h2>Third-Party Data Sources</h2>
          <p>
            BenefitGuard may use third-party data and services, including sources such as Google Places, NPPES, and
            CMS datasets. These sources may contain delays, omissions, or errors, and availability may change without
            notice. We are not responsible for inaccuracies in third-party data.
          </p>

          <h2>Additional Legal Documents</h2>
          <p>
            For more information, please also review our <Link href="/legal/terms">Terms</Link> and <Link href="/legal/privacy">Privacy Policy</Link>.
          </p>
        </article>
      </div>
    </main>
  );
}
