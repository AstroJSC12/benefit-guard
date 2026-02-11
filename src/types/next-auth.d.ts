import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    onboarded?: boolean;
    state?: string | null;
    zipCode?: string | null;
    emailVerified?: Date | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      onboarded?: boolean;
      state?: string | null;
      zipCode?: string | null;
      emailVerified?: string | null;
    };
    onboarded?: boolean;
    state?: string | null;
    zipCode?: string | null;
    emailVerified?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    onboarded?: boolean;
    state?: string | null;
    zipCode?: string | null;
    emailVerified?: Date | string | null;
  }
}
