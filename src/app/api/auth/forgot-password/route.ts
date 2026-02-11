import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { createPasswordResetToken } from "@/lib/auth-tokens";
import { getAppUrl } from "@/lib/app-url";
import { sendEmail } from "@/lib/email";
import { buildPasswordResetEmailTemplate } from "@/lib/email-templates";

type AttemptWindow = {
  count: number;
  resetAt: number;
};

const resetAttempts = new Map<string, AttemptWindow>();
const RESET_WINDOW_MS = 60 * 60 * 1000;
const RESET_MAX_ATTEMPTS = 3;

function isRateLimited(email: string) {
  const now = Date.now();
  const current = resetAttempts.get(email);

  if (!current || current.resetAt < now) {
    resetAttempts.set(email, { count: 1, resetAt: now + RESET_WINDOW_MS });
    return false;
  }

  if (current.count >= RESET_MAX_ATTEMPTS) {
    return true;
  }

  resetAttempts.set(email, {
    count: current.count + 1,
    resetAt: current.resetAt,
  });

  return false;
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (isRateLimited(email)) {
      return NextResponse.json(
        { error: "Too many reset requests. Please try again later." },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ success: true });
    }

    const resetToken = await createPasswordResetToken(user.id);
    const resetLink = `${getAppUrl()}/auth/reset-password?token=${resetToken.token}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your BenefitGuard password",
      html: buildPasswordResetEmailTemplate(resetLink),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Unable to process password reset request" },
      { status: 500 }
    );
  }
}
