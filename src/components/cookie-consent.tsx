"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import { ChevronDown, Cookie, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  hasConsentBeenGiven,
  setCookieConsent,
  type CookiePreferences,
} from "@/lib/cookies";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    setIsMounted(true);
    setIsVisible(!hasConsentBeenGiven());
  }, []);

  const handleAcceptAll = () => {
    setCookieConsent({
      essential: true,
      analytics: true,
      marketing: true,
    });
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    setCookieConsent(preferences);
    setIsVisible(false);
  };

  if (!isMounted || !isVisible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 px-4 sm:px-6">
      <div
        className={`pointer-events-auto mx-auto w-full max-w-3xl rounded-xl border border-border/70 bg-background/95 p-4 text-foreground shadow-lg backdrop-blur-md transition-all duration-300 ease-out ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary">
            <Cookie className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">We value your privacy</p>
              <p className="text-muted-foreground text-xs sm:text-sm">
                We use essential cookies to keep BenefitGuard secure and
                functional, and optional cookies to improve analytics and
                personalize marketing.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={handleAcceptAll}>
                Accept All
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsExpanded((current) => !current)}
                aria-expanded={isExpanded}
                aria-controls="cookie-preferences"
              >
                Manage Preferences
                <ChevronDown
                  className={`size-4 transition-transform ${
                    isExpanded ? "rotate-180" : "rotate-0"
                  }`}
                  aria-hidden="true"
                />
              </Button>
              <Link
                href="/legal/privacy"
                className="text-muted-foreground text-xs underline-offset-4 hover:underline"
              >
                Privacy Policy
              </Link>
            </div>

            <div
              id="cookie-preferences"
              className={`grid overflow-hidden transition-all duration-300 ${
                isExpanded
                  ? "mt-2 grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="min-h-0">
                <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
                  <PreferenceRow
                    icon={<ShieldCheck className="text-primary size-4" />}
                    title="Essential cookies"
                    description="Required for security, authentication, and core app functionality."
                    checked
                    disabled
                    onCheckedChange={() => undefined}
                  />

                  <PreferenceRow
                    title="Analytics cookies"
                    description="Help us understand usage patterns and improve the product experience."
                    checked={preferences.analytics}
                    onCheckedChange={(checked) =>
                      setPreferences((current) => ({
                        ...current,
                        analytics: checked,
                      }))
                    }
                  />

                  <PreferenceRow
                    title="Marketing cookies"
                    description="Used to tailor campaign messaging and measure outreach effectiveness."
                    checked={preferences.marketing}
                    onCheckedChange={(checked) =>
                      setPreferences((current) => ({
                        ...current,
                        marketing: checked,
                      }))
                    }
                  />

                  <div className="flex justify-end pt-1">
                    <Button size="sm" onClick={handleSavePreferences}>
                      Save Preferences
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type PreferenceRowProps = {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  onCheckedChange: (checked: boolean) => void;
};

function PreferenceRow({
  title,
  description,
  checked,
  disabled,
  icon,
  onCheckedChange,
}: PreferenceRowProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="space-y-0.5">
        <div className="flex items-center gap-1.5">
          {icon}
          <p className="text-sm font-medium">{title}</p>
        </div>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        aria-label={title}
      />
    </div>
  );
}
