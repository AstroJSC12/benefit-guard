import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-semibold">BenefitGuard</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/blog"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
            >
              Blog
            </Link>
            <Link
              href="/quiz"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
            >
              Free Quiz
            </Link>
            <ThemeToggle />
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button size="sm" variant="outline">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/auth/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="mb-3">
            BenefitGuard provides information about insurance coverage, not
            medical advice.
          </p>
          <div className="flex items-center justify-center gap-4 mb-3">
            {isLoggedIn && (
              <>
                <Link
                  href="/dashboard"
                  className="hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
                <span className="text-border">|</span>
              </>
            )}
            <Link
              href="/blog"
              className="hover:text-foreground transition-colors"
            >
              Blog
            </Link>
            <span className="text-border">|</span>
            <Link
              href="/quiz"
              className="hover:text-foreground transition-colors"
            >
              Free Quiz
            </Link>
            <span className="text-border">|</span>
            <Link
              href="/legal/terms"
              className="hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <span className="text-border">|</span>
            <Link
              href="/legal/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
          </div>
          <p>
            &copy; {new Date().getFullYear()} BenefitGuard. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
