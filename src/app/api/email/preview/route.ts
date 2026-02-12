import { NextRequest, NextResponse } from "next/server";
import { renderToStaticMarkup } from "react-dom/server";
import WelcomeEmail from "@/emails/welcome";
import PasswordResetEmail from "@/emails/password-reset";
import EmailVerificationEmail from "@/emails/email-verification";
import AccountDeletedEmail from "@/emails/account-deleted";

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse("Not Found", { status: 404 });
  }

  const template = request.nextUrl.searchParams.get("template");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  let html: string;

  switch (template) {
    case "welcome":
      html = renderToStaticMarkup(
        WelcomeEmail({
          name: "Alex",
          appUrl,
        })
      );
      break;
    case "password-reset":
      html = renderToStaticMarkup(
        PasswordResetEmail({
          resetUrl: `${appUrl}/reset-password?token=demo-token`,
        })
      );
      break;
    case "email-verification":
      html = renderToStaticMarkup(
        EmailVerificationEmail({
          verifyUrl: `${appUrl}/verify-email?token=demo-token`,
        })
      );
      break;
    case "account-deleted":
      html = renderToStaticMarkup(
        AccountDeletedEmail({
          name: "Alex",
        })
      );
      break;
    default:
      return NextResponse.json(
        {
          error:
            "Invalid template. Use one of: welcome, password-reset, email-verification, account-deleted",
        },
        { status: 400 }
      );
  }

  return new NextResponse(`<!DOCTYPE html>${html}`, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
