"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Shield,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ShieldX,
  ShieldCheck,
  ArrowRight,
  Loader2,
  BarChart3,
} from "lucide-react";

// --- Types ---

interface QuizOption {
  label: string;
  points: number;
  flags: string[];
}

interface Question {
  id: string;
  text: string;
  subtext: string;
  options: QuizOption[];
}

interface QuizResult {
  score: number;
  maxScore: number;
  tier: "low" | "moderate" | "high" | "critical";
  tierLabel: string;
  flags: string[];
}

// --- Data ---

const questions: Question[] = [
  {
    id: "denied_claim",
    text: "Have you had a health insurance claim denied in the past year?",
    subtext: "This includes any service, procedure, or medication your insurer refused to cover.",
    options: [
      { label: "Yes", points: 1, flags: ["denied_claim"] },
      { label: "No", points: 0, flags: [] },
    ],
  },
  {
    id: "surprise_bill",
    text: "Have you received a medical bill that was higher than you expected?",
    subtext: "A bill where the amount surprised you, or you weren\u2019t sure if it was correct.",
    options: [
      { label: "Yes", points: 1, flags: ["surprise_bill"] },
      { label: "No", points: 0, flags: [] },
    ],
  },
  {
    id: "literacy",
    text: "Could you confidently explain what your deductible, copay, and out-of-pocket maximum mean?",
    subtext: "Be honest \u2014 this isn\u2019t a test. Most people can\u2019t.",
    options: [
      { label: "Yes, confidently", points: 0, flags: [] },
      { label: "Not really", points: 1, flags: ["low_literacy"] },
    ],
  },
  {
    id: "prior_auth",
    text: "Has your insurance required prior authorization before approving a treatment or medication?",
    subtext: "Where you had to wait for your insurer to approve something before you could get it.",
    options: [
      { label: "Yes", points: 1, flags: ["prior_auth"] },
      { label: "No", points: 0, flags: [] },
      { label: "I don\u2019t know what that means", points: 1, flags: ["prior_auth", "low_literacy"] },
    ],
  },
  {
    id: "appeal_knowledge",
    text: "If a claim was denied tomorrow, would you know how to appeal it?",
    subtext: "Do you know the steps, who to contact, and what to say?",
    options: [
      { label: "Yes", points: 0, flags: [] },
      { label: "No", points: 1, flags: ["no_appeal_knowledge"] },
    ],
  },
  {
    id: "agency_knowledge",
    text: "Do you know which government agency to contact if your insurer refuses to cooperate?",
    subtext: "Not your insurance company \u2014 the agency that regulates them.",
    options: [
      { label: "Yes", points: 0, flags: [] },
      { label: "No", points: 1, flags: ["no_agency_knowledge"] },
    ],
  },
  {
    id: "overpaid",
    text: "Have you ever paid a medical bill you thought might be wrong, just to avoid the hassle?",
    subtext: "Paid it even though something felt off, because fighting it seemed harder.",
    options: [
      { label: "Yes", points: 1, flags: ["overpaid"] },
      { label: "No", points: 0, flags: [] },
    ],
  },
];

const flagInsights: Record<string, { stat: string; detail: string }> = {
  denied_claim: {
    stat: "18% of insured adults experience a denied claim every year.",
    detail: "Most never appeal \u2014 even though external reviews overturn denials 40-60% of the time. Your insurer is counting on you not fighting back.",
  },
  surprise_bill: {
    stat: "62% of Americans have received a medical bill higher than expected.",
    detail: "Up to 80% of hospital bills contain errors. Before you pay, you should audit every charge against your Explanation of Benefits.",
  },
  low_literacy: {
    stat: "Only 4% of Americans can correctly define basic health insurance terms.",
    detail: "This isn\u2019t your fault \u2014 the system is designed to be confusing. But understanding your plan is the single best defense against overpaying.",
  },
  prior_auth: {
    stat: "51% of insured adults have dealt with prior authorization.",
    detail: "47% find the process difficult. When prior auth is denied, most people don\u2019t know they can request a peer-to-peer review or file an expedited appeal.",
  },
  no_appeal_knowledge: {
    stat: "60% of insured Americans don\u2019t know they have legal appeal rights.",
    detail: "The ACA guarantees you the right to an internal appeal and an external review for every denied claim. This is federal law \u2014 your insurer can\u2019t opt out of it.",
  },
  no_agency_knowledge: {
    stat: "86% don\u2019t know what government agency to call for help.",
    detail: "Your state\u2019s Department of Insurance regulates your insurer. They handle complaints, investigate violations, and can intervene on your behalf. It\u2019s free.",
  },
  overpaid: {
    stat: "32% of patients pay bills they suspect are wrong just to avoid confusion.",
    detail: "This is exactly what the system counts on. Requesting an itemized bill and comparing it to your EOB takes 15 minutes and could save you hundreds or thousands.",
  },
};

const tierConfig = {
  low: {
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    barColor: "bg-emerald-500",
    icon: ShieldCheck,
    headline: "You\u2019re in Better Shape Than Most",
    description: "Your insurance knowledge and experience put you ahead of the curve. But 96% of Americans can\u2019t define basic insurance terms correctly \u2014 so don\u2019t get too comfortable.",
  },
  moderate: {
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    barColor: "bg-amber-500",
    icon: ShieldAlert,
    headline: "You\u2019re More Exposed Than You Think",
    description: "You\u2019re leaving money on the table and may not know your rights when you need them most. The gaps in your knowledge are exactly what insurance companies exploit.",
  },
  high: {
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    barColor: "bg-orange-500",
    icon: ShieldX,
    headline: "Your Insurance Is Costing You More Than It Should",
    description: "You\u2019ve been hit by the system and you don\u2019t have the tools to fight back. The good news: every single problem you flagged has a solution \u2014 and most of them are free.",
  },
  critical: {
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    barColor: "bg-red-500",
    icon: ShieldX,
    headline: "Your Insurance Is Absolutely Taking Advantage of You",
    description: "You\u2019re exactly the person insurance companies count on not fighting back. You\u2019ve been denied, overcharged, confused, and the system banked on you giving up. That changes today.",
  },
};

// --- Helpers ---

function calculateResults(answers: Record<string, QuizOption>): QuizResult {
  let score = 0;
  const allFlags: string[] = [];

  Object.values(answers).forEach((answer) => {
    score += answer.points;
    allFlags.push(...answer.flags);
  });

  const uniqueFlags = [...new Set(allFlags)];
  const maxScore = 7;

  let tier: QuizResult["tier"];
  if (score <= 1) tier = "low";
  else if (score <= 3) tier = "moderate";
  else if (score <= 5) tier = "high";
  else tier = "critical";

  const tierLabels = {
    low: "Low Risk",
    moderate: "Moderate Risk",
    high: "High Risk",
    critical: "Critical",
  };

  return { score, maxScore, tier, tierLabel: tierLabels[tier], flags: uniqueFlags };
}

// --- Component ---

export function InsuranceQuiz() {
  const [phase, setPhase] = useState<"intro" | "quiz" | "results">("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuizOption>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  // Email capture state
  const [email, setEmail] = useState("");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function handleStart() {
    setPhase("quiz");
  }

  function handleAnswer(option: QuizOption) {
    const question = questions[currentQ];
    const newAnswers = { ...answers, [question.id]: option };
    setAnswers(newAnswers);

    setTransitioning(true);
    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
      } else {
        const res = calculateResults(newAnswers);
        setResult(res);
        setPhase("results");
      }
      setTransitioning(false);
    }, 300);
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "quiz" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      setSubmitStatus("success");
    } catch (err) {
      setSubmitStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  const progress = phase === "quiz" ? ((currentQ + 1) / questions.length) * 100 : 0;

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

      <main className="pt-16">
        {/* --- INTRO --- */}
        {phase === "intro" && (
          <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
            <div className="max-w-2xl text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-sm font-medium mb-6">
                <AlertTriangle className="w-4 h-4" />
                Only 4% of Americans understand their insurance
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
                Is Your Insurance
                <span className="block text-primary">Screwing You?</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-xl mx-auto leading-relaxed">
                7 questions. 2 minutes. Find out if your health insurance is
                costing you more than it should &mdash; and what to do about it.
              </p>
              <p className="text-sm text-muted-foreground mb-10 max-w-md mx-auto">
                Based on federal consumer protection data and research from KFF,
                the AMA, and the CDC.
              </p>
              <Button
                size="lg"
                className="h-14 px-10 text-lg"
                onClick={handleStart}
              >
                Take the Quiz
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
              <div className="mt-12 grid grid-cols-3 gap-6 text-center max-w-md mx-auto">
                <div>
                  <p className="text-2xl font-bold text-primary">60%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    don&apos;t know they can appeal
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">86%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    don&apos;t know who to call
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">$220B</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    in US medical debt
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* --- QUIZ --- */}
        {phase === "quiz" && (
          <section className="min-h-[calc(100vh-4rem)] flex flex-col">
            {/* Progress Bar */}
            <div className="w-full bg-muted h-1.5">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex-1 flex items-center justify-center px-4 py-12">
              <div
                className={`max-w-xl w-full transition-all duration-300 ${
                  transitioning
                    ? "opacity-0 translate-x-4"
                    : "opacity-100 translate-x-0"
                }`}
              >
                {/* Question Counter */}
                <p className="text-sm text-muted-foreground mb-2">
                  Question {currentQ + 1} of {questions.length}
                </p>

                {/* Question */}
                <h2 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">
                  {questions[currentQ].text}
                </h2>
                <p className="text-muted-foreground mb-8">
                  {questions[currentQ].subtext}
                </p>

                {/* Options */}
                <div className="space-y-3">
                  {questions[currentQ].options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(option)}
                      className="w-full text-left p-4 rounded-xl border border-border/50 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base font-medium">
                          {option.label}
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* --- RESULTS --- */}
        {phase === "results" && result && (
          <section className="py-16 px-4">
            <div className="container mx-auto max-w-2xl">
              {/* Score Header */}
              <div className="text-center mb-12">
                <div
                  className={`w-20 h-20 rounded-2xl ${tierConfig[result.tier].bg} flex items-center justify-center mx-auto mb-6`}
                >
                  {(() => {
                    const Icon = tierConfig[result.tier].icon;
                    return (
                      <Icon
                        className={`w-10 h-10 ${tierConfig[result.tier].color}`}
                      />
                    );
                  })()}
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold mb-4"
                  style={{}}
                >
                  <BarChart3 className={`w-4 h-4 ${tierConfig[result.tier].color}`} />
                  <span className={tierConfig[result.tier].color}>
                    {result.tierLabel}: {result.score}/{result.maxScore}
                  </span>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  {tierConfig[result.tier].headline}
                </h2>
                <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
                  {tierConfig[result.tier].description}
                </p>
              </div>

              {/* Score Bar */}
              <div className="mb-12">
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${tierConfig[result.tier].barColor} transition-all duration-1000 ease-out`}
                    style={{ width: `${(result.score / result.maxScore) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Low Risk</span>
                  <span>Critical</span>
                </div>
              </div>

              {/* Personalized Insights */}
              {result.flags.length > 0 && (
                <div className="mb-12">
                  <h3 className="text-xl font-bold mb-6">
                    Here&apos;s What We Found
                  </h3>
                  <div className="space-y-4">
                    {result.flags
                      .filter((flag) => flagInsights[flag])
                      .slice(0, 4)
                      .map((flag) => {
                        const insight = flagInsights[flag];
                        return (
                          <div
                            key={flag}
                            className="p-4 rounded-xl border border-border/50 bg-card"
                          >
                            <p className="text-sm font-semibold text-primary mb-1">
                              {insight.stat}
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {insight.detail}
                            </p>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Email Capture */}
              <div className="p-8 rounded-2xl border border-primary/20 bg-primary/5">
                <h3 className="text-xl font-bold mb-2 text-center">
                  Get Your Personalized Action Plan
                </h3>
                <p className="text-sm text-muted-foreground text-center mb-6 max-w-md mx-auto">
                  Based on your results, we&apos;ll send you a free action plan
                  with the exact steps to protect yourself &mdash; including
                  phone scripts, your legal rights, and who to contact in your
                  state.
                </p>

                {submitStatus === "success" ? (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-lg font-semibold">Check your inbox.</p>
                    <p className="text-sm text-muted-foreground text-center max-w-sm">
                      Your personalized action plan is on its way. If you
                      don&apos;t see it in a few minutes, check your spam
                      folder.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={handleEmailSubmit}
                    className="flex flex-col sm:flex-row gap-3 w-full max-w-md mx-auto"
                  >
                    <input
                      type="email"
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="flex-1 h-12 px-4 rounded-md border border-input bg-background text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <Button
                      type="submit"
                      size="lg"
                      className="h-12 px-6 text-base whitespace-nowrap"
                      disabled={submitStatus === "loading"}
                    >
                      {submitStatus === "loading" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          Send My Plan
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </form>
                )}
                {submitStatus === "error" && (
                  <p className="text-sm text-destructive text-center mt-2">
                    {errorMsg}
                  </p>
                )}
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Free. No spam. Unsubscribe anytime.
                </p>
              </div>

              {/* BenefitGuard Bridge */}
              <div className="mt-12 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Want answers personalized to your exact plan, right now?
                </p>
                <Link href="/">
                  <Button variant="outline" size="lg">
                    Try BenefitGuard Free
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>

              {/* Trust */}
              <div className="mt-16 text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Built from federal consumer protection laws and research from
                  KFF, the AMA, and the CDC. BenefitGuard is an AI-powered
                  health insurance navigator designed to help real people
                  understand their coverage and fight for their rights.
                </p>
              </div>
            </div>
          </section>
        )}
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
