import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Section,
  Text,
} from "@react-email/components";

interface EmailVerificationEmailProps {
  verifyUrl: string;
}

export default function EmailVerificationEmail({ verifyUrl }: EmailVerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={brand}>BenefitGuard</Text>
          </Section>

          <Section style={contentSection}>
            <Text style={heading}>Verify Your Email</Text>
            <Text style={text}>
              Confirm your email address to secure your account and unlock all
              BenefitGuard features.
            </Text>

            <Button href={verifyUrl} style={button}>
              Verify Email
            </Button>

            <Text style={note}>This link expires in 24 hours.</Text>
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

const note = {
  color: "#71717a",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "16px 0 0",
};
