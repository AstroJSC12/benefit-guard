import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Shield,
  MessageSquare,
  FileText,
  Phone,
  MapPin,
  Scale,
  Heart,
  Clock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-semibold">BenefitGuard</span>
          </div>
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/auth/signin">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Insurance Guidance
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
              Navigate Healthcare Insurance
              <span className="block text-primary">With Confidence</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Your personal AI co-pilot for understanding coverage, fighting
              unfair bills, and knowing your rights. Available 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="text-base px-8 h-12">
                  Start Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button size="lg" variant="outline" className="text-base px-8 h-12">
                  <Phone className="w-4 h-4 mr-2" />
                  Call for Help
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-4 border-t border-border/50">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Everything You Need
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Powerful tools to help you understand, navigate, and advocate for your healthcare benefits.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Understand Coverage
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Upload your insurance documents and get plain-English
                    explanations of what&apos;s covered.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                    <Scale className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Know Your Rights</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Learn about laws like the No Surprises Act that protect you
                    from unfair billing.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Find Care</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Locate nearby urgent care centers and hospitals when you need
                    them most.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4 bg-muted/30 border-t border-border/50">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Help When You Need It Most
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Healthcare is stressful enough. We&apos;re here to make it easier.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Emergency Support</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Get instant answers about ER coverage, even when
                    you&apos;re stressed and scared.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Bill Review</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Understand medical bills and spot errors before you pay.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Scale className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Appeal Guidance</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Step-by-step help appealing denied claims and fighting
                    back.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">24/7 Availability</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Chat online or call anytime—healthcare emergencies
                    don&apos;t wait for business hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-20 px-4 border-t border-border/50">
          <div className="container mx-auto max-w-3xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Your Privacy is Protected
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
              Your health information is sensitive. We use enterprise-grade
              encryption and never share your data. You&apos;re in control.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                End-to-end encryption
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                No data selling
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                HIPAA-aware design
              </div>
            </div>
            <Link href="/auth/signup">
              <Button size="lg" className="h-12 px-8">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="mb-2">
            BenefitGuard provides information about insurance coverage, not
            medical advice.
          </p>
          <p>© {new Date().getFullYear()} BenefitGuard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
