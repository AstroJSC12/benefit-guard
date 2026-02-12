import { Resend } from "resend";
import WelcomeEmail from "@/emails/welcome";
import PasswordResetEmail from "@/emails/password-reset";
import EmailVerificationEmail from "@/emails/email-verification";
import AccountDeletedEmail from "@/emails/account-deleted";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || "BenefitGuard <noreply@benefitguard.app>";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

type EmailResult = {
  success: boolean;
  error?: string;
};

export async function sendWelcomeEmail(to: string, name: string): Promise<EmailResult> {
  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to,
      subject: "Welcome to BenefitGuard",
      react: WelcomeEmail({ name, appUrl }),
    });

    if (result.error) {
      console.error("Failed to send welcome email:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to send welcome email:", error);
    return { success: false, error: message };
  }
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<EmailResult> {
  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to,
      subject: "Reset your BenefitGuard password",
      react: PasswordResetEmail({ resetUrl }),
    });

    if (result.error) {
      console.error("Failed to send password reset email:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to send password reset email:", error);
    return { success: false, error: message };
  }
}

export async function sendEmailVerificationEmail(
  to: string,
  verifyUrl: string
): Promise<EmailResult> {
  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to,
      subject: "Verify your BenefitGuard email",
      react: EmailVerificationEmail({ verifyUrl }),
    });

    if (result.error) {
      console.error("Failed to send email verification email:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to send email verification email:", error);
    return { success: false, error: message };
  }
}

export async function sendAccountDeletedEmail(
  to: string,
  name: string
): Promise<EmailResult> {
  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to,
      subject: "Your BenefitGuard account has been deleted",
      react: AccountDeletedEmail({ name }),
    });

    if (result.error) {
      console.error("Failed to send account deleted email:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to send account deleted email:", error);
    return { success: false, error: message };
  }
}

export { appUrl, fromEmail };
