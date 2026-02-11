import crypto from "crypto";
import prisma from "@/lib/db";

export async function createEmailVerificationToken(userId: string) {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.verificationToken.deleteMany({ where: { userId } });

  return prisma.verificationToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });
}

export async function createPasswordResetToken(userId: string) {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordResetToken.deleteMany({ where: { userId } });

  return prisma.passwordResetToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });
}
