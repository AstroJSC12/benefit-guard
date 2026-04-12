import Link from "next/link";
import { Shield, ArrowLeft, Clock, Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { BlogArticle } from "@/lib/blog";
import { getRelatedArticles } from "@/lib/blog";

interface ArticleLayoutProps {
  article: BlogArticle;
  children: React.ReactNode;
}

export function ArticleLayout({ article, children }: ArticleLayoutProps) {
  const related = getRelatedArticles(article.slug);

  return (
    <article className="pb-20">
      {/* Article Header */}
      <div className="border-b border-border/50 bg-muted/20 pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all articles
          </Link>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 leading-tight">
            {article.title}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">
            {article.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <time dateTime={article.publishedAt}>
                {new Date(article.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {article.readingTime}
            </div>
          </div>
        </div>
      </div>

      {/* Article Body */}
      <div className="container mx-auto max-w-3xl px-4 pt-10">
        <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3 prose-p:leading-relaxed prose-p:text-foreground/90 prose-li:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-blockquote:border-primary/30 prose-blockquote:text-muted-foreground">
          {children}
        </div>

        {/* Quiz CTA */}
        <div className="mt-16 p-8 rounded-2xl bg-primary/5 border border-primary/20 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-3">
            Not Sure Where You Stand?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Take our free 2-minute quiz to find out if your health insurance has
            gaps that could cost you — and get a personalized action plan.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/quiz">
              <Button size="lg" className="text-base px-8">
                Take the Free Quiz
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline" className="text-base px-8">
                Try BenefitGuard Free
              </Button>
            </Link>
          </div>
        </div>

        {/* Related Articles */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Keep Reading</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link key={r.slug} href={`/blog/${r.slug}`}>
                  <Card className="h-full hover:border-primary/30 transition-colors">
                    <CardContent className="pt-6 pb-4 px-5">
                      <span className="text-xs font-medium text-primary uppercase tracking-wide">
                        {r.category === "guides"
                          ? "Guide"
                          : r.category === "rights"
                            ? "Your Rights"
                            : "Glossary"}
                      </span>
                      <h3 className="font-semibold mt-2 mb-2 leading-snug line-clamp-2">
                        {r.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {r.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
