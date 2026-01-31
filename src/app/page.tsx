import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield,
  MessageSquare,
  FileText,
  Phone,
  MapPin,
  Scale,
  Heart,
  Clock,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">BenefitGuard</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Navigate Healthcare Insurance{" "}
              <span className="text-primary">With Confidence</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Your personal AI co-pilot for understanding coverage, fighting
              unfair bills, and knowing your rights. Available 24/7 via chat or
              phone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="text-lg px-8">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Start Free
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  <Phone className="w-5 h-5 mr-2" />
                  Call for Help
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <FileText className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">
                  Understand Your Coverage
                </h3>
                <p className="text-muted-foreground">
                  Upload your insurance documents and get plain-English
                  explanations of what&apos;s covered.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <Scale className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Know Your Rights</h3>
                <p className="text-muted-foreground">
                  Learn about laws like the No Surprises Act that protect you
                  from unfair billing practices.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Find Care</h3>
                <p className="text-muted-foreground">
                  Locate nearby urgent care centers and hospitals when you need
                  them most.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="bg-muted/50 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8">
                Help When You Need It Most
              </h2>
              <div className="grid sm:grid-cols-2 gap-6 text-left">
                <div className="flex gap-4">
                  <Heart className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Emergency Support</h3>
                    <p className="text-sm text-muted-foreground">
                      Get instant answers about ER coverage, even when
                      you&apos;re stressed and scared.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <FileText className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Bill Review</h3>
                    <p className="text-sm text-muted-foreground">
                      Understand medical bills and spot errors before you pay.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Scale className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Appeal Guidance</h3>
                    <p className="text-sm text-muted-foreground">
                      Step-by-step help appealing denied claims and fighting
                      back.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Clock className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">24/7 Availability</h3>
                    <p className="text-sm text-muted-foreground">
                      Chat online or call anytime—healthcare emergencies
                      don&apos;t wait for business hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              Your Privacy is Protected
            </h2>
            <p className="text-muted-foreground mb-8">
              Your health information is sensitive. We use enterprise-grade
              encryption and never share your data. You&apos;re in control of
              your information.
            </p>
            <Link href="/auth/signup">
              <Button size="lg">
                <Shield className="w-5 h-5 mr-2" />
                Get Started Securely
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
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
