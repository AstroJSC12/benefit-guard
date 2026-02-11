import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — BenefitGuard",
  description: "Privacy Policy for BenefitGuard. Learn how we collect, use, and protect your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground text-sm mb-8">Last updated: February 11, 2026</p>

      <p>
        BenefitGuard (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to
        protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and
        safeguard your information when you use the BenefitGuard website, application, and services
        (the &ldquo;Service&rdquo;). Because our Service handles health insurance information, we
        take data protection extremely seriously.
      </p>

      <h2>1. Information We Collect</h2>

      <h3>1.1 Information You Provide Directly</h3>
      <ul>
        <li>
          <strong>Account information:</strong> Name, email address, and password when you create an
          account
        </li>
        <li>
          <strong>Profile information:</strong> Zip code, state of residence, and insurance company
          name (provided during onboarding to personalize your experience)
        </li>
        <li>
          <strong>Uploaded documents:</strong> Insurance documents you upload for analysis, such as
          Summary of Benefits and Coverage (SBC), Explanation of Benefits (EOB), medical bills,
          denial letters, and formularies. These documents may contain personal health information,
          insurance plan details, and financial information.
        </li>
        <li>
          <strong>Chat conversations:</strong> Questions you ask and the AI-generated responses, which
          are stored to maintain your conversation history
        </li>
        <li>
          <strong>Provider verification data:</strong> When you verify whether a healthcare provider
          is in your insurance network, that verification is stored to help other users with the
          same insurer
        </li>
      </ul>

      <h3>1.2 Information Collected Automatically</h3>
      <ul>
        <li>
          <strong>Device and browser information:</strong> Browser type, operating system, device
          type, and screen resolution
        </li>
        <li>
          <strong>Usage data:</strong> Pages visited, features used, timestamps, and interaction
          patterns
        </li>
        <li>
          <strong>Error data:</strong> Application errors and performance metrics collected through
          our error monitoring service (Sentry) to improve reliability
        </li>
        <li>
          <strong>Session data:</strong> Authentication tokens and session identifiers required to
          keep you logged in
        </li>
      </ul>

      <h3>1.3 Information from Third-Party Sources</h3>
      <ul>
        <li>
          <strong>Provider data:</strong> Healthcare provider information from Google Places API and
          the National Plan and Provider Enumeration System (NPPES), used to populate provider
          search results
        </li>
        <li>
          <strong>Network status data:</strong> In-network provider information from CMS
          Transparency in Coverage machine-readable files, used to display network status badges
        </li>
        <li>
          <strong>OAuth providers:</strong> If you sign in with Google or Apple, we receive your name
          and email address from those services (we never receive your passwords from these
          providers)
        </li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>
          <strong>Provide the Service:</strong> Generate AI-powered responses to your insurance
          questions using your uploaded documents and our knowledge base as context
        </li>
        <li>
          <strong>Personalize your experience:</strong> Use your location and insurer to show
          relevant state laws, in-network providers, and insurer-specific information
        </li>
        <li>
          <strong>Process documents:</strong> Extract text from uploaded PDFs and images (including
          OCR for scanned documents), create searchable embeddings, and store them for retrieval
          during conversations
        </li>
        <li>
          <strong>Improve the Service:</strong> Analyze usage patterns, identify bugs through error
          monitoring, and understand which features are most valuable
        </li>
        <li>
          <strong>Communicate with you:</strong> Send account-related emails such as verification,
          password reset, and important service updates
        </li>
        <li>
          <strong>Ensure security:</strong> Detect and prevent fraud, abuse, and unauthorized access
          through rate limiting and monitoring
        </li>
      </ul>

      <h2>3. Third-Party Services</h2>
      <p>
        We share data with the following third-party services, strictly to provide and improve the
        Service:
      </p>

      <table>
        <thead>
          <tr>
            <th>Service</th>
            <th>Purpose</th>
            <th>Data Shared</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>OpenAI</strong></td>
            <td>AI chat responses and document embeddings</td>
            <td>Your questions, relevant document excerpts, and conversation context</td>
          </tr>
          <tr>
            <td><strong>Neon</strong></td>
            <td>Database hosting (PostgreSQL)</td>
            <td>All stored data (encrypted in transit and at rest)</td>
          </tr>
          <tr>
            <td><strong>Vercel</strong></td>
            <td>Application hosting and deployment</td>
            <td>Application logs, request data</td>
          </tr>
          <tr>
            <td><strong>Google Places API</strong></td>
            <td>Provider search and geocoding</td>
            <td>Search queries (zip code or address), provider type</td>
          </tr>
          <tr>
            <td><strong>Sentry</strong></td>
            <td>Error monitoring and performance tracking</td>
            <td>Error stack traces, browser info, anonymized session data</td>
          </tr>
          <tr>
            <td><strong>Upstash Redis</strong></td>
            <td>Rate limiting</td>
            <td>IP addresses and request counts (temporary, auto-expiring)</td>
          </tr>
        </tbody>
      </table>

      <p>
        We do NOT sell, rent, or share your personal information with advertisers, data brokers, or
        any party not listed above. We do not use your data for advertising purposes.
      </p>

      <h3>3.1 OpenAI Data Processing</h3>
      <p>
        When you ask a question, relevant excerpts from your uploaded documents and our knowledge
        base are sent to OpenAI&apos;s API to generate a response. OpenAI&apos;s data usage
        policies apply to this processing. As of our last review, OpenAI does not use API data to
        train its models. We encourage you to review{" "}
        <a
          href="https://openai.com/policies/api-data-usage-policies"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          OpenAI&apos;s API data usage policies
        </a>{" "}
        for the most current information.
      </p>

      <h2>4. Data Retention</h2>
      <ul>
        <li>
          <strong>Account data:</strong> Retained as long as your account is active. Deleted within
          30 days of account deletion.
        </li>
        <li>
          <strong>Uploaded documents:</strong> Stored as long as your account is active. You can
          delete individual documents at any time from the Documents page. All documents are deleted
          when you delete your account.
        </li>
        <li>
          <strong>Chat history:</strong> Stored as long as your account is active. You can delete
          individual conversations at any time. All conversations are deleted when you delete your
          account.
        </li>
        <li>
          <strong>Provider verification data:</strong> Retained indefinitely to benefit all users,
          but not linked to your identity after account deletion.
        </li>
        <li>
          <strong>Error logs:</strong> Retained for 90 days, then automatically purged.
        </li>
      </ul>

      <h2>5. Data Security</h2>
      <p>We implement multiple layers of security to protect your data:</p>
      <ul>
        <li>
          <strong>Encryption in transit:</strong> All data transmitted between your browser and our
          servers is encrypted using TLS 1.2+ (HTTPS enforced via HSTS)
        </li>
        <li>
          <strong>Encryption at rest:</strong> Database storage on Neon uses AES-256 encryption at
          rest
        </li>
        <li>
          <strong>Authentication:</strong> Passwords are hashed using bcrypt with salt rounds;
          session tokens are cryptographically signed
        </li>
        <li>
          <strong>Access control:</strong> Users can only access their own documents, conversations,
          and profile data
        </li>
        <li>
          <strong>Rate limiting:</strong> API endpoints are rate-limited to prevent abuse
        </li>
        <li>
          <strong>Security headers:</strong> Content Security Policy, HSTS, X-Frame-Options, and
          other headers protect against common web attacks
        </li>
      </ul>
      <p>
        While we strive to protect your information, no method of electronic transmission or storage
        is 100% secure. We cannot guarantee absolute security.
      </p>

      <h2>6. Your Rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>
          <strong>Access your data:</strong> View all information we hold about you through your
          account dashboard and settings
        </li>
        <li>
          <strong>Correct your data:</strong> Update your profile information at any time through
          account settings
        </li>
        <li>
          <strong>Delete your data:</strong> Delete individual documents, conversations, or your
          entire account. Account deletion removes all associated data within 30 days.
        </li>
        <li>
          <strong>Export your data:</strong> Request a copy of your data by contacting us at
          privacy@benefitguard.app
        </li>
        <li>
          <strong>Opt out of non-essential processing:</strong> You can use the Service without
          uploading documents (using only our knowledge base for general insurance questions)
        </li>
      </ul>
      <p>
        If you are a California resident, you may have additional rights under the California
        Consumer Privacy Act (CCPA). If you are a resident of the European Economic Area, you may
        have additional rights under GDPR. Contact us at privacy@benefitguard.app to exercise these
        rights.
      </p>

      <h2>7. Cookies and Tracking</h2>
      <p>BenefitGuard uses minimal cookies:</p>
      <ul>
        <li>
          <strong>Session cookie:</strong> Required for authentication — keeps you logged in.
          Expires when you close your browser or after the session timeout.
        </li>
        <li>
          <strong>Theme preference:</strong> Stores your light/dark mode choice. Stored locally, not
          transmitted to our servers.
        </li>
      </ul>
      <p>
        We do NOT use advertising cookies, third-party tracking pixels, or analytics cookies that
        track you across other websites.
      </p>

      <h2>8. Children&apos;s Privacy</h2>
      <p>
        BenefitGuard is not intended for individuals under the age of 18. We do not knowingly
        collect personal information from children. If you believe we have collected information from
        a minor, please contact us immediately at privacy@benefitguard.app and we will promptly
        delete the information.
      </p>

      <h2>9. HIPAA Notice</h2>
      <p>
        BenefitGuard is designed with awareness of health information sensitivity, but we are{" "}
        <strong>not a HIPAA-covered entity</strong> (we are not a healthcare provider, health plan,
        or healthcare clearinghouse). While we implement strong security measures to protect your
        health-related information, the HIPAA Privacy and Security Rules do not directly apply to
        our Service. We encourage you to be thoughtful about what health information you share with
        any online service.
      </p>

      <h2>10. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. When we make material changes, we will
        notify you by email or by posting a prominent notice on the Service. The &ldquo;Last
        updated&rdquo; date at the top of this page reflects the most recent revision.
      </p>

      <h2>11. Contact Us</h2>
      <p>
        For questions or concerns about this Privacy Policy or our data practices, contact us at:
      </p>
      <ul>
        <li>
          <strong>Privacy inquiries:</strong>{" "}
          <a href="mailto:privacy@benefitguard.app" className="text-primary hover:underline">
            privacy@benefitguard.app
          </a>
        </li>
        <li>
          <strong>Data deletion requests:</strong>{" "}
          <a href="mailto:privacy@benefitguard.app" className="text-primary hover:underline">
            privacy@benefitguard.app
          </a>
        </li>
        <li>
          <strong>General support:</strong>{" "}
          <a href="mailto:support@benefitguard.app" className="text-primary hover:underline">
            support@benefitguard.app
          </a>
        </li>
      </ul>
    </article>
  );
}
