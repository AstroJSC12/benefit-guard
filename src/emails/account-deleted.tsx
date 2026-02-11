import { Body, Container, Head, Html, Section, Text } from "@react-email/components";

interface AccountDeletedEmailProps {
  name: string;
}

export default function AccountDeletedEmail({ name }: AccountDeletedEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={brand}>BenefitGuard</Text>
          </Section>

          <Section style={contentSection}>
            <Text style={heading}>Your Account Has Been Deleted</Text>
            <Text style={text}>Hi {name},</Text>
            <Text style={text}>
              This confirms your BenefitGuard account has been permanently
              deleted, and all associated data has been removed from our
              systems.
            </Text>
            <Text style={text}>
              We&apos;re sorry to see you go, and we appreciate the time you spent
              with us.
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
  margin: "0 0 16px",
};
