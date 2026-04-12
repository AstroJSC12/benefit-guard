import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Clock, ChevronRight } from "lucide-react";
import { articles } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Health Insurance Blog — Guides, Rights & Tips | BenefitGuard",
  description:
    "Free guides on appealing denied claims, reading your EOB, checking medical bills for errors, and understanding your health insurance rights. Plain English, no jargon.",
  openGraph: {
    title: "Health Insurance Blog | BenefitGuard",
    description:
      "Free guides on appealing denied claims, reading your EOB, and knowing your insurance rights.",
    type: "website",
    url: "https://benefit-guard.jeffcoy.net/blog",
  },
};

export default function BlogIndexPage() {
  return (
    <div>
      {/* Hero */}
      <section className="pt-28 pb-12 px-4 border-b border-border/50 bg-muted/20">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Health Insurance,{" "}
            <span className="text-primary">Finally Explained</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Free guides written in plain English. No jargon, no legal-speak —
            just the information you need to understand your coverage, fight
            unfair bills, and know your rights.
          </p>
          <Link href="/quiz">
            <Button size="lg" className="text-base">
              Take the Free Insurance Quiz
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid gap-6">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="group"
              >
                <Card className="hover:border-primary/30 transition-all hover:shadow-sm">
                  <CardContent className="p-6 flex gap-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-medium text-primary uppercase tracking-wide">
                          {article.category === "guides"
                            ? "Guide"
                            : article.category === "rights"
                              ? "Your Rights"
                              : "Glossary"}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {article.readingTime}
                        </div>
                      </div>
                      <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </h2>
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                        {article.description}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-2" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-12 px-4 bg-muted/30 border-t border-border/50">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold mb-3">
            Want Answers Specific to Your Plan?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            These guides cover the basics. BenefitGuard reads your actual
            insurance documents and gives you personalized answers in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/quiz">
              <Button size="lg">Take the Free Quiz</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline">
                Try BenefitGuard Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
