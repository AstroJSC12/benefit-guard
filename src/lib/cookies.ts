export type CookiePreferences = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
};

const COOKIE_CONSENT_KEY = "bg-cookie-consent";

export function getCookieConsent(): CookiePreferences | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedConsent = window.localStorage.getItem(COOKIE_CONSENT_KEY);

  if (!storedConsent) {
    return null;
  }

  try {
    const parsedConsent = JSON.parse(storedConsent) as CookiePreferences;

    if (
      parsedConsent.essential === true &&
      typeof parsedConsent.analytics === "boolean" &&
      typeof parsedConsent.marketing === "boolean"
    ) {
      return parsedConsent;
    }
  } catch {
    return null;
  }

  return null;
}

export function setCookieConsent(preferences: CookiePreferences): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(preferences));
}

export function hasConsentBeenGiven(): boolean {
  return getCookieConsent() !== null;
}
