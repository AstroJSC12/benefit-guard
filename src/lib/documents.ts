import prisma from "./db";
import { generateEmbeddings } from "./openai";
import { isLikelyScanned, ocrPdfBuffer } from "./ocr";

// Polyfill browser APIs that pdfjs-dist expects but don't exist in Node.js
// We only extract text (not render), so empty stubs are fine
if (typeof globalThis.DOMMatrix === "undefined") {
  // @ts-expect-error - stub for Node.js compatibility
  globalThis.DOMMatrix = class DOMMatrix {
    m: number[] = [1, 0, 0, 1, 0, 0];
    constructor() { this.m = [1, 0, 0, 1, 0, 0]; }
    isIdentity = true;
    translate() { return this; }
    scale() { return this; }
    transformPoint() { return { x: 0, y: 0 }; }
    inverse() { return this; }
  };
}
if (typeof globalThis.Path2D === "undefined") {
  // @ts-expect-error - stub for Node.js compatibility
  globalThis.Path2D = class Path2D {};
}
if (typeof globalThis.ImageData === "undefined") {
  // @ts-expect-error - stub for Node.js compatibility
  globalThis.ImageData = class ImageData {
    data: Uint8ClampedArray; width: number; height: number;
    constructor(w: number, h: number) { this.width = w; this.height = h; this.data = new Uint8ClampedArray(w * h * 4); }
  };
}

// Chunking parameters tuned for insurance documents
// CHUNK_SIZE: ~800 chars balances context window usage with retrieval precision
// CHUNK_OVERLAP: 200 chars ensures we don't lose context at chunk boundaries
const CHUNK_SIZE = 1500;
const CHUNK_OVERLAP = 300;

// Maximum file size we'll process (10MB) - larger files may timeout
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Process a PDF document: extract text, chunk it, generate embeddings, and store.
 * This runs asynchronously after upload - status is tracked in the database.
 * 
 * IMPORTANT: This function should be called in a fire-and-forget manner.
 * The caller should NOT await this - it updates the document status in the DB.
 */
export async function processDocument(
  documentId: string,
  fileBuffer: Buffer
): Promise<void> {
  try {
    // Validate file size before processing
    if (fileBuffer.length > MAX_FILE_SIZE) {
      throw new Error(`File too large (${Math.round(fileBuffer.length / 1024 / 1024)}MB). Maximum size is 10MB.`);
    }

    await prisma.document.update({
      where: { id: documentId },
      data: { status: "processing" },
    });

    let rawText: string;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PDFParse } = require("pdf-parse");
      const pdf = new PDFParse({ verbosity: 0, data: fileBuffer });
      const result = await pdf.getText();
      rawText = (result.text || result.pages.map((p: { text: string }) => p.text).join("\n\n"))
        .replace(/\0/g, ""); // Strip null bytes - some PDFs embed these and Postgres rejects them
    } catch (parseError) {
      console.error("PDF parse error:", parseError);
      throw new Error("Unable to read this PDF. It may be corrupted or password-protected.");
    }
    
    // Check if we actually extracted any text — if not, try OCR
    if (isLikelyScanned(rawText)) {
      console.log(`Document ${documentId}: Low text extraction (${rawText?.trim().length || 0} chars), attempting OCR...`);
      try {
        rawText = await ocrPdfBuffer(fileBuffer);
        console.log(`Document ${documentId}: OCR extracted ${rawText.length} chars`);
      } catch (ocrError) {
        console.error(`Document ${documentId}: OCR failed:`, ocrError);
        throw new Error(
          "Could not extract text from this PDF. It appears to be a scanned document " +
          "and OCR was unable to read it. Try uploading a higher quality scan."
        );
      }

      // Verify OCR produced enough text
      if (isLikelyScanned(rawText)) {
        throw new Error(
          "OCR could not extract enough readable text from this scanned PDF. " +
          "The scan quality may be too low — try rescanning at a higher resolution."
        );
      }
    }

    await prisma.document.update({
      where: { id: documentId },
      data: { rawText },
    });

    const chunks = chunkText(rawText);

    // Batch all embeddings in a single API call — 10x faster than one per chunk
    const embeddings = await generateEmbeddings(chunks);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embeddingStr = `[${embeddings[i].join(",")}]`;

      await prisma.$executeRaw`
        INSERT INTO "DocumentChunk" (id, "documentId", content, embedding, "chunkIndex", "createdAt")
        VALUES (
          ${`chunk_${documentId}_${i}`},
          ${documentId},
          ${chunk},
          ${embeddingStr}::vector,
          ${i},
          NOW()
        )
      `;
    }

    await prisma.document.update({
      where: { id: documentId },
      data: { status: "completed" },
    });
  } catch (error) {
    console.error("Document processing error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown processing error";
    try {
      await prisma.document.update({
        where: { id: documentId },
        data: { 
          status: "error",
          rawText: `ERROR: ${errorMessage}`,
        },
      });
    } catch (dbError) {
      console.error("Failed to update error status:", dbError);
    }
    // Rethrow so the caller can capture the error message
    throw error;
  }
}

/**
 * Clean extracted PDF text before chunking.
 * Removes non-English language access sections, excessive whitespace, and noise.
 * SBC documents are legally required to include 30+ language translations
 * which are pure noise for an English-only app.
 */
function cleanExtractedText(text: string): string {
  let cleaned = text;

  // Remove language access / translation sections
  // These typically start with a language name followed by translation text
  // Pattern: lines that are predominantly non-ASCII (non-English translations)
  const lines = cleaned.split("\n");
  const filteredLines = lines.filter((line) => {
    const trimmed = line.trim();
    if (trimmed.length < 5) return true; // keep short lines (spacing)

    // Count non-ASCII characters (non-English text)
    const nonAsciiCount = (trimmed.match(/[^\x00-\x7F]/g) || []).length;
    const nonAsciiRatio = nonAsciiCount / trimmed.length;

    // If >30% non-ASCII, it's likely a non-English translation line
    if (nonAsciiRatio > 0.3) return false;

    // Remove common language access intro patterns
    if (/^(Albanian|Amharic|Arabic|Armenian|Bantu|Bengali|Burmese|Cambodian|Catalan|Chamorro|Cherokee|Chinese|Chuukese|Croatian|Czech|Dutch|Farsi|French|German|Greek|Gujarati|Hawaiian|Hebrew|Hindi|Hmong|Hungarian|Igbo|Ilocano|Indonesian|Italian|Japanese|Kannada|Karen|Korean|Kurdish|Laotian|Marathi|Marshallese|Navajo|Nepali|Nilotic|Oromo|Persian|Polish|Portuguese|Punjabi|Romanian|Russian|Samoan|Serbo|Serbian|Sinhala|Slovenian|Somali|Spanish|Swahili|Tagalog|Tamil|Telugu|Thai|Tibetan|Tongan|Turkish|Ukrainian|Urdu|Vietnamese|Wolof|Yiddish|Yoruba)\s*[-–—:]/i.test(trimmed)) {
      return false;
    }

    return true;
  });

  cleaned = filteredLines.join("\n");

  // Collapse excessive whitespace
  cleaned = cleaned
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

  return cleaned;
}

function chunkText(text: string): string[] {
  const cleanedText = cleanExtractedText(text);

  const words = cleanedText.split(/\s+/);
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentLength = 0;

  for (const word of words) {
    currentChunk.push(word);
    currentLength += word.length + 1;

    if (currentLength >= CHUNK_SIZE) {
      chunks.push(currentChunk.join(" "));
      
      const overlapWords = Math.floor(CHUNK_OVERLAP / 5);
      currentChunk = currentChunk.slice(-overlapWords);
      currentLength = currentChunk.join(" ").length;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(" "));
  }

  return chunks;
}

/**
 * Detect document type from filename.
 * This is a simple heuristic - could be improved with content analysis.
 * 
 * Known types: sbc, eob, denial_letter, medical_bill, formulary, other
 */
export function detectDocumentType(fileName: string): string {
  const lowerName = fileName.toLowerCase();
  
  // Summary of Benefits and Coverage - the key plan document
  if (lowerName.includes("sbc") || lowerName.includes("summary of benefits")) {
    return "sbc";
  }
  // Explanation of Benefits - shows what was billed/paid
  if (lowerName.includes("eob") || lowerName.includes("explanation of benefits")) {
    return "eob";
  }
  // Claim denial letters
  if (lowerName.includes("denial") || lowerName.includes("denied")) {
    return "denial_letter";
  }
  // Medical bills and statements
  if (lowerName.includes("bill") || lowerName.includes("statement") || lowerName.includes("invoice")) {
    return "medical_bill";
  }
  // Drug formularies
  if (lowerName.includes("formulary") || lowerName.includes("drug list")) {
    return "formulary";
  }
  
  // Default - user can still ask questions about any PDF
  return "other";
}
