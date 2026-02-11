import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Section,
  Text,
} from "@react-email/components";

interface WelcomeEmailProps {
  name: string;
  appUrl: string;
}

export default function WelcomeEmail({ name, appUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={brand}>BenefitGuard</Text>
          </Section>

          <Section style={contentSection}>
            <Text style={heading}>Welcome to BenefitGuard, {name}!</Text>
            <Text style={text}>
              We&apos;re excited to help you take control of your health benefits.
              You can upload insurance documents, ask plan-related questions, and
              discover in-network providers with confidence.
            </Text>

            <Button href={`${appUrl}/dashboard`} style={button}>
              Go to Dashboard
            </Button>
          </Section>

          <Hr style={divider} />

          <Section>
            <Text style={footerText}>
              You&apos;re receiving this email because you created a BenefitGuard
              account. If this wasn&apos;t you, please contact support.
            </Text>
            <Text style={footerText}>
              BenefitGuard, Inc. • 1234 Main Street, Suite 500 • San Francisco,
              CA 94105
            </Text>
            <Text style={footerText}>
              <Link href={`${appUrl}/legal/privacy`} style={footerLink}>
                Privacy Policy
              </Link>
              {" · "}
              <Link href={`${appUrl}/legal/terms`} style={footerLink}>
                Terms
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#f4f4f5",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  margin: "0",
  padding: "32px 16px",
};

const container = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  margin: "0 auto",
  maxWidth: "600px",
  overflow: "hidden",
  width: "100%",
};

const header = {
  backgroundColor: "#2563eb",
  padding: "24px",
  textAlign: "center" as const,
};

const brand = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "700",
  letterSpacing: "0.4px",
  margin: "0",
};

const contentSection = {
  padding: "32px 24px",
};

const heading = {
  color: "#1a1a1a",
  fontSize: "28px",
  fontWeight: "700",
  lineHeight: "36px",
  margin: "0 0 16px",
};

const text = {
  color: "#1a1a1a",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 24px",
};

const button = {
  backgroundColor: "#2563eb",
  borderRadius: "8px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: "600",
  padding: "12px 20px",
  textDecoration: "none",
};

const divider = {
  borderColor: "#e4e4e7",
  margin: "0",
};

const footerText = {
  color: "#71717a",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0 24px 12px",
};

const footerLink = {
  color: "#71717a",
  textDecoration: "underline",
};
