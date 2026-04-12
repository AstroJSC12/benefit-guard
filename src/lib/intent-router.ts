/**
 * Lightweight intent classifier for the concierge home page.
 * Maps user input to either a direct navigation route or a chat message.
 *
 * Design philosophy: be generous with matching — false positives go to chat
 * (which can handle anything), but false negatives miss a smooth navigation.
 */

export type IntentResult =
  | { type: "navigate"; route: string }
  | { type: "chat"; message: string };

const PROVIDER_NOUNS =
  /\b(doctor|provider|hospital|clinic|urgent\s*care|dentist|pharmacy|specialist|physician|pediatrician|dermatologist|therapist|psychiatrist|ob-?gyn|optometrist|ophthalmologist|orthopedist|cardiologist|neurologist|ent|allergist|chiropractor|physical\s*therap|nurse\s*practitioner|emergency\s*room|er)\b/i;

const FIND_VERBS =
  /\b(find|search|look\s*for|locate|show|where|nearby|nearest|closest|looking\s*for|need|see)\b/i;

const UPLOAD_VERBS =
  /\b(upload|scan|add|import|submit|share)\b/i;

const DOC_NOUNS =
  /\b(document|bill|eob|pdf|insurance\s*card|file|paper|statement|form|receipt)\b/i;

const VIEW_VERBS =
  /\b(view|see|check|review|manage|open|look\s*at)\b/i;

export function classifyIntent(input: string): IntentResult {
  const lower = input.toLowerCase().trim();

  // ── Provider / doctor finding ──
  if (FIND_VERBS.test(lower) && PROVIDER_NOUNS.test(lower)) {
    return { type: "navigate", route: "/dashboard/providers" };
  }
  // Short direct phrases: "I need a doctor", "find hospital"
  if (/^(i\s+need|find|search|look\s*for|show\s*me)\s+(a\s+)?/i.test(lower) && PROVIDER_NOUNS.test(lower)) {
    return { type: "navigate", route: "/dashboard/providers" };
  }

  // ── Document upload ──
  if (UPLOAD_VERBS.test(lower) && DOC_NOUNS.test(lower)) {
    return { type: "navigate", route: "/dashboard/documents" };
  }
  // "my documents", "view my files"
  if (VIEW_VERBS.test(lower) && /\b(my\s+)?(document|file)s?\b/i.test(lower)) {
    return { type: "navigate", route: "/dashboard/documents" };
  }

  // ── Settings ──
  if (/^(settings|my\s+account|my\s+profile|preferences|account\s+settings)$/i.test(lower)) {
    return { type: "navigate", route: "/dashboard/settings" };
  }
  if (/\b(change|update|edit)\b.*\b(settings|account|profile|password|email)\b/i.test(lower)) {
    return { type: "navigate", route: "/dashboard/settings" };
  }

  // ── Default: send to chat ──
  return { type: "chat", message: input };
}
