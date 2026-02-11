import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | BenefitGuard",
  description:
    "Read how BenefitGuard collects, uses, stores, and protects personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <article className="prose prose-slate max-w-none dark:prose-invert prose-headings:scroll-mt-20">
      <h1>Privacy Policy</h1>
      <p className="text-sm text-muted-foreground">Last updated: February 2026</p>

      <p>
        This Privacy Policy explains how BenefitGuard collects, uses, stores, and protects personal information when you use our platform.
      </p>

      <h2>1. Information We Collect</h2>
      <ul>
        <li>
          <strong>Profile information:</strong> name, email address, ZIP code, and insurer details provided during onboarding or account updates.
        </li>
        <li>
          <strong>Chat history:</strong> questions you submit and AI-generated responses.
        </li>
        <li>
          <strong>Uploaded documents:</strong> files such as explanations of benefits (EOBs), bills, and related insurance documents.
        </li>
        <li>
          <strong>Provider verification data:</strong> information related to provider network checks and search results.
        </li>
        <li>
          <strong>Usage analytics:</strong> device, session, and feature interaction data to help us understand app performance and usage patterns.
        </li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>Provide AI-powered insurance guidance and contextual responses.</li>
        <li>Enable provider lookup and network verification workflows.</li>
        <li>Store and display your chat and document history within your account.</li>
        <li>Improve product quality, reliability, and user experience.</li>
        <li>Maintain security, prevent abuse, and comply with legal obligations.</li>
      </ul>

      <h2>3. Third-Party Services and Processors</h2>
      <p>
        We rely on service providers to operate BenefitGuard. These providers may process data on our behalf, subject to their terms and privacy practices:
      </p>
      <ul>
        <li>OpenAI for AI model processing and response generation.</li>
        <li>Neon for PostgreSQL database hosting.</li>
        <li>Vercel for application hosting and infrastructure.</li>
        <li>Google Places API for provider search and location-related queries.</li>
      </ul>

      <h2>4. Data Retention</h2>
      <ul>
        <li>Chat history is retained in your account until you delete it (or your account is deleted).</li>
        <li>Uploaded documents are processed and stored to support ongoing document analysis and history access.</li>
        <li>We may retain limited records as required for security, compliance, dispute resolution, and legal obligations.</li>
      </ul>

      <h2>5. Your Rights and Choices</h2>
      <p>Depending on applicable law, you may request to:</p>
      <ul>
        <li>Access the personal data we hold about you.</li>
        <li>Correct inaccurate or incomplete profile information.</li>
        <li>Delete your data or account, subject to legal and operational exceptions.</li>
      </ul>

      <h2>6. Security Measures</h2>
      <p>
        We use administrative, technical, and organizational safeguards designed to protect your data, including access controls and encryption in transit. No system is completely secure, but we continuously work to improve our security posture.
      </p>

      <h2>7. Cookies</h2>
      <p>
        BenefitGuard uses essential cookies, including session cookies used for authentication and account security. These cookies are necessary for core app functionality.
      </p>

      <h2>8. Children&apos;s Privacy</h2>
      <p>
        BenefitGuard is not intended for anyone under 18 years of age, and we do not knowingly collect personal information from children.
      </p>

      <h2>9. Changes to This Privacy Policy</h2>
      <p>
        We may update this Privacy Policy periodically. When material updates are made, we may notify users within the product or by other reasonable means.
      </p>

      <h2>10. Contact Us</h2>
      <p>
        For privacy-related questions or requests, contact us at <a href="mailto:privacy@benefitguard.app">privacy@benefitguard.app</a>.
      </p>
    </article>
  );
}
