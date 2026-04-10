import type { Metadata } from "next";
import { InsuranceQuiz } from "@/components/insurance-quiz";

export const metadata: Metadata = {
  title: "Is Your Insurance Screwing You? | Free Quiz | BenefitGuard",
  description:
    "Take this 2-minute quiz to find out if your health insurance is costing you more than it should. Get personalized recommendations and a free action plan.",
  openGraph: {
    title: "Is Your Insurance Screwing You? | Free Quiz",
    description:
      "Most Americans can't define basic insurance terms. 60% don't know they can appeal denied claims. Find out where you stand in 2 minutes.",
  },
};

export default function QuizPage() {
  return <InsuranceQuiz />;
}
