import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import bcrypt from "bcryptjs";
import prisma from "./db";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID ?? "",
      clientSecret: process.env.APPLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("No user found with this email");
        }

        if (!user.passwordHash) {
          throw new Error(
            "This account uses Google or Apple sign-in. Please use that method instead."
          );
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          onboarded: user.onboarded,
          state: user.state,
          zipCode: user.zipCode,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Credentials provider handles its own auth — always allow
      if (account?.provider === "credentials") return true;

      // OAuth sign-in: link or create user
      if (!user.email || !account) return false;

      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { accounts: true },
        });

        if (existingUser) {
          // Check if this OAuth provider is already linked
          const linked = existingUser.accounts.find(
            (a) =>
              a.provider === account.provider &&
              a.providerAccountId === account.providerAccountId
          );

          if (!linked) {
            // Link new OAuth provider to existing user
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                type: account.type ?? "oauth",
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
              },
            });
          }

          // Update profile picture if we don't have one
          if (!existingUser.image && user.image) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { image: user.image },
            });
          }

          // Attach the existing user ID so JWT callback gets it
          user.id = existingUser.id;
        } else {
          // New user via OAuth — create user + account
          const newUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || profile?.name || null,
              image: user.image || null,
            },
          });

          await prisma.account.create({
            data: {
              userId: newUser.id,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              type: account.type ?? "oauth",
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
            },
          });

          user.id = newUser.id;
        }

        return true;
      } catch (error) {
        console.error("OAuth sign-in error:", error);
        return false;
      }
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.picture = user.image;

        // For OAuth users, fetch full profile from DB
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id as string },
          select: { onboarded: true, state: true, zipCode: true },
        });
        if (dbUser) {
          token.onboarded = dbUser.onboarded;
          token.state = dbUser.state;
          token.zipCode = dbUser.zipCode;
        }
      }
      if (trigger === "update" && session) {
        token.onboarded = session.onboarded;
        token.state = session.state;
        token.zipCode = session.zipCode;
        token.name = session.name;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.onboarded = token.onboarded as boolean;
        session.user.state = token.state as string | null;
        session.user.zipCode = token.zipCode as string | null;
        session.user.image = token.picture as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
