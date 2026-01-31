import { Suspense } from "react";
import { SignInForm } from "@/components/auth/signin-form";
import { Loader2 } from "lucide-react";

function SignInLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInLoading />}>
      <SignInForm />
    </Suspense>
  );
}
