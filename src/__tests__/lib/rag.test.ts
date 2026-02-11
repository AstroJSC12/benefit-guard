import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockPrisma, resetMockPrisma } from "@/__tests__/helpers/mock-prisma";

const generateEmbedding = vi.fn();

vi.mock("@/lib/db", () => ({ default: mockPrisma }));
vi.mock("@/lib/openai", () => ({ generateEmbedding }));

describe("lib/rag", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    resetMockPrisma();
  });

  it("expandQueryKeywords maps therapist terms", async () => {
    const { __testables } = await import("@/lib/rag");

    const keywords = __testables.expandQueryKeywords("Need a therapist for counseling");

    expect(keywords).toContain("mental health");
    expect(keywords).toContain("outpatient services");
  });

  it("expandQueryKeywords deduplicates repeated terms", async () => {
    const { __testables } = await import("@/lib/rag");

    const keywords = __testables.expandQueryKeywords("copay copay copayment");

    expect(new Set(keywords).size).toBe(keywords.length);
  });

  it("buildContextPrompt formats user docs with source links", async () => {
    const { buildContextPrompt } = await import("@/lib/rag");

    const prompt = buildContextPrompt({
      userDocuments: [
        { id: "chunk-1", content: "Coverage details", source: "Your document: policy.pdf", similarity: 0.9, documentId: "doc-123" },
      ],
      knowledgeBase: [],
    });

    expect(prompt).toContain("INFORMATION FROM USER'S DOCUMENTS");
    expect(prompt).toContain("[View Source](/dashboard/documents/doc-123/view?chunk=chunk-1)");
  });

  it("buildContextPrompt formats knowledge base links", async () => {
    const { buildContextPrompt } = await import("@/lib/rag");

    const prompt = buildContextPrompt({
      userDocuments: [],
      knowledgeBase: [
        { id: "kb-1", content: "Law text", source: "Federal: Rule", similarity: 0.8, sourceUrl: "https://example.gov/rule" },
      ],
    });

    expect(prompt).toContain("RELEVANT LAWS & REGULATIONS");
    expect(prompt).toContain("[Official Source](https://example.gov/rule)");
  });

  it("retrieveContext returns merged user and knowledge results", async () => {
    generateEmbedding.mockResolvedValue([0.1, 0.2]);
    mockPrisma.$queryRaw
      .mockResolvedValueOnce([
        { id: "vec-1", content: "A", fileName: "a.pdf", documentId: "doc-a", similarity: 0.8 },
      ])
      .mockResolvedValueOnce([
        { id: "kw-1", content: "B", fileName: "b.pdf", documentId: "doc-b", similarity: 0.85 },
      ])
      .mockResolvedValueOnce([
        { id: "kb-1", content: "C", title: "Rule", category: "State", sourceUrl: null, similarity: 0.9 },
      ]);

    const { retrieveContext } = await import("@/lib/rag");
    const result = await retrieveContext("therapist coverage", "user-1", "CA");

    expect(result.userDocuments).toHaveLength(2);
    expect(result.knowledgeBase).toHaveLength(1);
  });
});
