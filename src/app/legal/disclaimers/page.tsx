import type { Metadata } from "next";
import { AlertTriangle, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Disclaimers — BenefitGuard",
  description: "Important disclaimers about BenefitGuard. We provide information, not medical, legal, or financial advice.",
};

export default function DisclaimersPage() {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Disclaimers</h1>
      <p className="text-muted-foreground text-sm mb-8">Last updated: February 11, 2026</p>

      <div className="not-prose rounded-lg border-2 border-destructive/30 bg-destructive/5 p-5 mb-8">
        <div className="flex items-start gap-3">
          <Phone className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-destructive mb-1">Medical Emergency</p>
            <p className="text-sm">
              If you are experiencing a medical emergency, call <strong>911</strong> immediately or go
              to your nearest emergency room. Do not use BenefitGuard to seek emergency medical
              guidance. This service cannot provide emergency assistance.
            </p>
          </div>
        </div>
      </div>

      <div className="not-prose rounded-lg border border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 p-5 mb-8">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-300 mb-1">
              Important: BenefitGuard Is Not a Substitute for Professional Advice
            </p>
            <p className="text-sm text-amber-900/80 dark:text-amber-200/80">
              BenefitGuard provides general informational content about health insurance. It does not
              provide medical, legal, financial, tax, or insurance advice. Always consult qualified
              professionals before making decisions about your health, legal rights, or finances.
            </p>
          </div>
        </div>
      </div>

      <h2>1. Not Medical Advice</h2>
      <p>
        BenefitGuard is an informational tool about health <em>insurance</em>, not health{" "}
        <em>care</em>. We do not:
      </p>
      <ul>
        <li>Diagnose medical conditions or symptoms</li>
        <li>Recommend medical treatments, procedures, or medications</li>
        <li>Provide clinical opinions or second opinions on medical decisions</li>
        <li>Replace the advice of physicians, nurses, or other healthcare professionals</li>
        <li>Determine whether a medical procedure is medically necessary</li>
      </ul>
      <p>
        If you have questions about your health or a medical condition, consult a licensed healthcare
        provider. If a response from BenefitGuard discusses a medical topic, it is only in the
        context of how insurance coverage may apply — not as clinical guidance.
      </p>

      <h2>2. Not Legal Advice</h2>
      <p>
        BenefitGuard provides information about healthcare laws and regulations (such as the No
        Surprises Act, the Affordable Care Act, HIPAA, ERISA, and state insurance laws) for
        educational purposes. We do not:
      </p>
      <ul>
        <li>Provide legal advice or legal representation</li>
        <li>Create an attorney-client relationship</li>
        <li>Guarantee specific legal outcomes for your situation</li>
        <li>Replace consultation with a licensed attorney</li>
        <li>Interpret how specific laws apply to your individual circumstances</li>
      </ul>
      <p>
        Laws vary by state and change over time. The information in our knowledge base reflects our
        understanding as of the date it was last updated, but may not reflect the most current legal
        developments. If you need legal advice about a denied claim, a billing dispute, or your
        rights under any law, consult a licensed attorney or your state&apos;s Department of
        Insurance.
      </p>

      <h2>3. Not Financial or Insurance Advice</h2>
      <p>BenefitGuard does not:</p>
      <ul>
        <li>Recommend specific insurance plans, policies, or coverage levels</li>
        <li>Advise on whether to accept or reject a settlement or payment plan</li>
        <li>Provide tax advice regarding medical expenses or Health Savings Accounts</li>
        <li>Act as an insurance broker, agent, or adjuster</li>
        <li>Determine your out-of-pocket costs with certainty</li>
      </ul>
      <p>
        Cost estimates, coverage interpretations, and benefit summaries provided by BenefitGuard are
        based on the documents you upload and our AI&apos;s interpretation of them. These are
        approximations only. Your actual costs and coverage depend on your specific plan terms, your
        insurer&apos;s determinations, and the specific circumstances of your care. Always contact
        your insurance company directly to confirm coverage and costs before making financial
        decisions.
      </p>

      <h2>4. AI Limitations</h2>
      <p>
        BenefitGuard uses artificial intelligence (OpenAI GPT-4o) to generate responses. While we
        strive for accuracy, AI technology has inherent limitations:
      </p>
      <ul>
        <li>
          <strong>Responses may be inaccurate:</strong> AI can misinterpret questions, misread
          document content, or generate plausible-sounding but incorrect information
          (&ldquo;hallucinations&rdquo;)
        </li>
        <li>
          <strong>Knowledge may be outdated:</strong> Our AI&apos;s training data has a cutoff date,
          and insurance regulations, plan terms, and provider networks change frequently
        </li>
        <li>
          <strong>Context is limited:</strong> The AI only sees excerpts from your documents (not the
          full text) and may miss important details that appear elsewhere in your plan documents
        </li>
        <li>
          <strong>No understanding of nuance:</strong> AI cannot fully understand the unique
          circumstances of your situation the way a human professional can
        </li>
        <li>
          <strong>Document processing errors:</strong> Our OCR and text extraction may introduce
          errors, especially with scanned documents, handwritten notes, or poor-quality images
        </li>
      </ul>
      <p>
        We include source citations in AI responses whenever possible so you can verify the
        information against your original documents.
      </p>

      <h2>5. Provider Directory Disclaimer</h2>
      <p>
        Our &ldquo;Find Providers&rdquo; feature uses data from multiple sources:
      </p>
      <ul>
        <li>
          <strong>Google Places API:</strong> Provides location, hours, ratings, and contact
          information. This data is maintained by Google and the providers themselves, and may be
          outdated or inaccurate.
        </li>
        <li>
          <strong>NPPES (National Provider Registry):</strong> Provides NPI numbers and specialty
          classifications. This is a government database that providers self-report to, and may not
          reflect current practice information.
        </li>
        <li>
          <strong>CMS Transparency in Coverage data:</strong> Provides in-network/out-of-network
          status based on machine-readable files published by insurers. This data is published
          monthly and may not reflect real-time network changes. A provider shown as
          &ldquo;in-network&rdquo; may have left the network since the data was last updated.
        </li>
        <li>
          <strong>User-verified network status:</strong> Some network status information is
          contributed by other users. While we believe this is helpful, user-submitted data is not
          verified by BenefitGuard or any insurer.
        </li>
      </ul>
      <p className="font-semibold">
        Always confirm a provider&apos;s network status, hours, and availability directly with your
        insurance company and the provider&apos;s office before scheduling an appointment.
      </p>

      <h2>6. Third-Party Content and Links</h2>
      <p>
        BenefitGuard may link to external websites, including government sites (.gov), insurer
        provider directories, and other resources. We provide these links for your convenience and
        do not endorse, control, or assume responsibility for the content, accuracy, or practices of
        any third-party site.
      </p>

      <h2>7. No Guarantee of Results</h2>
      <p>
        BenefitGuard cannot guarantee that using our Service will result in any particular outcome,
        including but not limited to:
      </p>
      <ul>
        <li>Successful claim appeals or dispute resolutions</li>
        <li>Reduced medical bills or out-of-pocket costs</li>
        <li>Accurate determination of your benefits or coverage</li>
        <li>Finding an in-network provider near you</li>
      </ul>
      <p>
        The effectiveness of the information we provide depends on many factors outside our control,
        including the accuracy of your uploaded documents, the specifics of your insurance plan, and
        the decisions of your insurer and healthcare providers.
      </p>

      <h2>8. Service Availability</h2>
      <p>
        BenefitGuard is provided on an &ldquo;as available&rdquo; basis. We do not guarantee
        uninterrupted access to the Service. The Service may be temporarily unavailable due to
        maintenance, updates, or factors beyond our control. We are not liable for any harm resulting
        from Service interruptions.
      </p>

      <h2>9. Contact Us</h2>
      <p>
        If you have questions about these disclaimers, please contact us at{" "}
        <a href="mailto:legal@benefitguard.app" className="text-primary hover:underline">
          legal@benefitguard.app
        </a>
        .
      </p>

      <div className="not-prose mt-8 pt-6 border-t border-border/50 text-sm text-muted-foreground">
        <p>
          See also:{" "}
          <a href="/legal/terms" className="text-primary hover:underline">Terms of Service</a>
          {" | "}
          <a href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</a>
        </p>
      </div>
    </article>
  );
}
