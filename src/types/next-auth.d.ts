import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    image?: string | null;
    onboarded?: boolean;
    state?: string | null;
    zipCode?: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      onboarded?: boolean;
      state?: string | null;
      zipCode?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    picture?: string | null;
    onboarded?: boolean;
    state?: string | null;
    zipCode?: string | null;
  }
}
