import Link from "next/link";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto max-w-4xl px-4 py-12 md:py-16">{children}</main>
      <footer className="border-t border-border/60">
        <div className="container mx-auto flex max-w-4xl flex-col gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} BenefitGuard</p>
          <div className="flex items-center gap-4">
            <Link href="/legal/terms" className="transition-colors hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/legal/privacy" className="transition-colors hover:text-foreground">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
