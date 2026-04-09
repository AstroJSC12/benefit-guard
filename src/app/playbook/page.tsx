import Link from "next/link";
import type { Metadata } from "next";
import { ThemeToggle } from "@/components/theme-toggle";
import { LeadCaptureForm } from "@/components/lead-capture-form";
import {
  Shield,
  FileText,
  Scale,
  ListChecks,
  Phone,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "The Denied Claim Playbook — Free Guide | BenefitGuard",
  description:
    "Your health insurance claim was denied. This free playbook gives you the exact 5-step process and word-for-word letter templates to fight it and win.",
};

export default function PlaybookLandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-semibold">BenefitGuard</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-sm font-medium mb-6">
              <AlertTriangle className="w-4 h-4" />
              60% of Americans don&apos;t know they can appeal
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
              Your Insurance Denied Your Claim.
              <span className="block text-primary">Here&apos;s How to Fight It.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              A free, step-by-step playbook with word-for-word appeal letter
              templates. No legal jargon. No guesswork. Just the exact process
              real people use to overturn denied claims.
            </p>
            <LeadCaptureForm />
            <p className="text-xs text-muted-foreground mt-3">
              Free. No spam. Unsubscribe anytime.
            </p>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-16 px-4 border-t border-border/50">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
              The System Is Counting on You Giving Up
            </h2>
            <div className="grid sm:grid-cols-3 gap-6 text-center">
              <div className="p-6 rounded-xl bg-card border border-border/50">
                <p className="text-3xl md:text-4xl font-bold text-primary mb-2">18%</p>
                <p className="text-sm text-muted-foreground">
                  of insured adults had a claim denied last year
                </p>
              </div>
              <div className="p-6 rounded-xl bg-card border border-border/50">
                <p className="text-3xl md:text-4xl font-bold text-primary mb-2">60%</p>
                <p className="text-sm text-muted-foreground">
                  don&apos;t know they have legal appeal rights
                </p>
              </div>
              <div className="p-6 rounded-xl bg-card border border-border/50">
                <p className="text-3xl md:text-4xl font-bold text-primary mb-2">86%</p>
                <p className="text-sm text-muted-foreground">
                  don&apos;t know what agency to call for help
                </p>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Source: KFF Survey of Consumer Experiences with Health Insurance
            </p>
          </div>
        </section>

        {/* Who This Is For */}
        <section className="py-16 px-4 bg-muted/30 border-t border-border/50">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              This Is for You If...
            </h2>
            <p className="text-muted-foreground text-center mb-8 max-w-xl mx-auto">
              You just got a letter (or a line on your EOB) saying your insurance
              won&apos;t pay. Maybe it says &quot;not medically necessary.&quot;
              Maybe &quot;out of network.&quot; Maybe just &quot;not covered&quot;
              with zero explanation.
            </p>
            <div className="space-y-4 max-w-lg mx-auto">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm leading-relaxed">
                  You&apos;re frustrated, confused, and don&apos;t know where to start
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm leading-relaxed">
                  You&apos;ve never filed an insurance appeal in your life
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm leading-relaxed">
                  You don&apos;t want to hire a lawyer or a $200/hour advocate
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm leading-relaxed">
                  You just want someone to walk you through it, step by step
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What's Inside */}
        <section className="py-16 px-4 border-t border-border/50">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
              What&apos;s Inside the Playbook
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ListChecks className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">The 5-Step Appeal Process</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Broken down in plain English from start to finish. No
                    insurance background needed.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">3 Appeal Letter Templates</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Word-for-word templates for &quot;not medically
                    necessary,&quot; &quot;out of network,&quot; and &quot;not
                    covered&quot; denials. Copy, fill in, send.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Scale className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Know Your Rights Cheat Sheet</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The ACA, No Surprises Act, and Mental Health Parity Act
                    explained in plain English so you can push back with
                    confidence.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">State Regulator Contacts</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    All 50 states plus DC. Know exactly who to call if your
                    insurer won&apos;t budge.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefit Bullets + Second CTA */}
        <section className="py-16 px-4 bg-muted/30 border-t border-border/50">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">
              What You&apos;ll Walk Away With
            </h2>
            <div className="space-y-5 text-left max-w-xl mx-auto mb-10">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="leading-relaxed">
                  <span className="font-semibold">The exact 5-step appeal process</span>{" "}
                  that works for any denial type, so you can stop spiraling and
                  take action today.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="leading-relaxed">
                  <span className="font-semibold">3 word-for-word appeal letter templates</span>{" "}
                  you can copy, fill in, and send tonight, so you never have to
                  stare at a blank page wondering what to write.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="leading-relaxed">
                  <span className="font-semibold">Your legal rights in plain English</span>{" "}
                  under the ACA and No Surprises Act, so you can push back with
                  real confidence instead of just hoping for the best.
                </p>
              </div>
            </div>
            <LeadCaptureForm />
            <p className="text-xs text-muted-foreground mt-3">
              Free. No spam. Unsubscribe anytime.
            </p>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16 px-4 border-t border-border/50">
          <div className="container mx-auto max-w-3xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Built from federal consumer protection laws and the same curated
              knowledge base used by BenefitGuard, the AI-powered health
              insurance navigator. We help real people understand their coverage
              and fight for their rights.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="mb-3">
            BenefitGuard provides information about insurance coverage, not
            medical advice.
          </p>
          <div className="flex items-center justify-center gap-4 mb-3">
            <Link
              href="/legal/terms"
              className="hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
            <span className="text-border">|</span>
            <Link
              href="/legal/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-border">|</span>
            <Link
              href="/legal/disclaimers"
              className="hover:text-foreground transition-colors"
            >
              Disclaimers
            </Link>
          </div>
          <p>&copy; {new Date().getFullYear()} BenefitGuard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
