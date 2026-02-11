import { Resend } from "resend";

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM || "noreply@benefitguard.app";

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendEmail({ to, subject, html }: SendEmailInput) {
  if (!resend) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  await resend.emails.send({
    from: emailFrom,
    to,
    subject,
    html,
  });
}
