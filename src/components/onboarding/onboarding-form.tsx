"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { US_STATES } from "@/types";
import { DocumentUpload } from "@/components/documents/document-upload";
import { User, MapPin, FileText, CheckCircle, Loader2 } from "lucide-react";

type Step = "name" | "location" | "documents" | "complete";

export function OnboardingForm() {
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [state, setState] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { update } = useSession();

  const steps: Step[] = ["name", "location", "documents", "complete"];
  const currentStepIndex = steps.indexOf(step);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setStep("location");
    }
  };

  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zipCode.trim() || !state) {
      setError("Please enter your zip code and select your state");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, zipCode, state }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save");
      }

      await update({ onboarded: true, name, zipCode, state });
      setStep("documents");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipDocuments = () => {
    setStep("complete");
  };

  const handleComplete = () => {
    router.push("/dashboard/chat");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to BenefitGuard</CardTitle>
          <CardDescription>
            Let&apos;s get you set up in just a few steps
          </CardDescription>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        <CardContent>
          {step === "name" && (
            <form onSubmit={handleNameSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">What should we call you?</h3>
                <p className="text-sm text-muted-foreground">
                  This helps personalize your experience
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  autoFocus
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                Continue
              </Button>
            </form>
          )}

          {step === "location" && (
            <form onSubmit={handleLocationSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Where are you located?</h3>
                <p className="text-sm text-muted-foreground">
                  This helps us provide state-specific insurance information and find nearby providers
                </p>
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="12345"
                    maxLength={5}
                    pattern="[0-9]*"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <select
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="">Select your state</option>
                    {US_STATES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("name")}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </div>
            </form>
          )}

          {step === "documents" && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Upload Your Documents</h3>
                <p className="text-sm text-muted-foreground">
                  Upload your insurance documents so we can provide personalized guidance
                </p>
              </div>

              <DocumentUpload />

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSkipDocuments}
                  className="flex-1"
                >
                  Skip for Now
                </Button>
                <Button onClick={() => setStep("complete")} className="flex-1">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === "complete" && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">You&apos;re All Set!</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {name ? `Welcome, ${name}! ` : ""}
                  BenefitGuard is ready to help you navigate your healthcare insurance.
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 text-left text-sm space-y-2">
                <p className="font-medium">What you can do:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Ask questions about your insurance coverage</li>
                  <li>Get help understanding medical bills</li>
                  <li>Learn about your rights as a patient</li>
                  <li>Find nearby healthcare providers</li>
                </ul>
              </div>

              <Button onClick={handleComplete} className="w-full" size="lg">
                Start Chatting
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
