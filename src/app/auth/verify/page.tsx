import Link from "next/link";
import prisma from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, CircleAlert } from "lucide-react";

async function verifyToken(token: string) {
  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record || record.expiresAt < new Date()) {
    if (record) {
      await prisma.verificationToken.delete({ where: { token } });
    }
    return { success: false };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({ where: { token } }),
  ]);

  return { success: true };
}

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CircleAlert className="w-10 h-10 text-destructive mx-auto mb-2" />
            <CardTitle>Missing verification token</CardTitle>
            <CardDescription>Please use the link from your email.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const result = await verifyToken(token);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {result.success ? (
            <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-2" />
          ) : (
            <CircleAlert className="w-10 h-10 text-destructive mx-auto mb-2" />
          )}
          <CardTitle>{result.success ? "Email verified" : "Invalid or expired link"}</CardTitle>
          <CardDescription>
            {result.success
              ? "Your account is now verified."
              : "Request a new verification link by signing up again or contacting support."}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link href="/auth/signin" className="text-primary hover:underline text-sm font-medium">
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
