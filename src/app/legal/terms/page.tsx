import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | BenefitGuard",
  description:
    "Read BenefitGuard's Terms of Service, including eligibility, acceptable use, and important disclaimers.",
};

export default function TermsOfServicePage() {
  return (
    <article className="prose prose-slate max-w-none dark:prose-invert prose-headings:scroll-mt-20">
      <h1>Terms of Service</h1>
      <p className="text-sm text-muted-foreground">Last updated: February 2026</p>

      <p>
        Welcome to BenefitGuard. These Terms of Service govern your access to and use of the BenefitGuard platform, including our AI chat guidance, provider lookup, and document analysis tools.
      </p>

      <div className="my-6 rounded-lg border border-primary/30 bg-primary/5 p-4">
        <p className="m-0 font-semibold text-foreground">
          Important Disclaimer: BenefitGuard is an informational tool and is not a medical, legal, or financial advisor. Our AI responses are for general educational purposes only and are not a substitute for licensed professional advice.
        </p>
      </div>

      <h2>1. Service Description</h2>
      <p>
        BenefitGuard helps people better understand health insurance benefits and administrative processes. We may provide explanations related to coverage language, claim and billing information, provider network checks, and related healthcare insurance topics. We do not diagnose, treat, or provide medical care, and we do not provide legal representation.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        You may use BenefitGuard only if you are at least 18 years old and a resident of the United States. By creating an account or using the service, you represent and warrant that you meet these eligibility requirements.
      </p>

      <h2>3. Account Responsibilities</h2>
      <ul>
        <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
        <li>You are responsible for all activity that occurs under your account.</li>
        <li>You agree to provide accurate information during signup and profile setup.</li>
        <li>You must promptly notify us at support@benefitguard.app if you suspect unauthorized access.</li>
      </ul>

      <h2>4. Acceptable Use Policy</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use BenefitGuard for any unlawful, fraudulent, or abusive purpose.</li>
        <li>Upload malicious code, attempt to disrupt our systems, or bypass security safeguards.</li>
        <li>Use automated scraping, reverse engineering, or model extraction techniques on our service.</li>
        <li>Impersonate another person or submit intentionally false insurance or healthcare information.</li>
        <li>Use the platform to generate harmful, discriminatory, or deceptive content.</li>
      </ul>

      <h2>5. Disclaimers</h2>
      <p>
        BenefitGuard is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We make no warranties regarding completeness, reliability, or fitness for a particular purpose. Information provided through BenefitGuard may be incomplete, outdated, or incorrect and should be independently verified.
      </p>
      <p>
        You should always consult qualified professionals for medical decisions, legal rights and obligations, and financial planning.
      </p>

      <h2>6. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, BenefitGuard and its affiliates, officers, employees, and partners are not liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of data, revenue, profits, or goodwill arising out of or related to your use of the service.
      </p>

      <h2>7. Data Usage and Privacy</h2>
      <p>
        Your use of BenefitGuard is also governed by our Privacy Policy, which explains how we collect, use, and retain your information. Please review it at /legal/privacy.
      </p>

      <h2>8. Changes to These Terms</h2>
      <p>
        We may update these Terms of Service from time to time. If we make material changes, we may provide notice through the app, email, or other reasonable methods. Continued use of the service after updated terms become effective constitutes acceptance.
      </p>

      <h2>9. Termination</h2>
      <p>
        We reserve the right to suspend or terminate access to BenefitGuard at our discretion, including for violations of these Terms or behavior that threatens the security, integrity, or availability of the service.
      </p>

      <h2>10. Governing Law</h2>
      <p>
        These Terms are governed by and construed in accordance with the laws of the United States, without regard to conflict-of-law principles.
      </p>

      <h2>11. Contact Us</h2>
      <p>
        For questions about these Terms, contact us at <a href="mailto:support@benefitguard.app">support@benefitguard.app</a>.
      </p>
    </article>
  );
}
